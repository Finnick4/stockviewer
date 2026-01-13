package database

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"sync"

	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
)

var db *sql.DB

func getDB() *sql.DB {
	if db == nil {
		log.Debug("Connecting to DB")
		connectToDB()
	}
	return db
}

func CloseDB() {
	err := db.Close()
	if err != nil {
		return
	}
}

func connectToDB() {
	log.Debug("Connecting to DB")
	dbHost, ok := os.LookupEnv("DB_HOST")
	if !ok {
		log.Warn("DB_HOST is not set in .env! Using default value.")
		dbHost = "localhost"
	}
	dbPort, ok := os.LookupEnv("DB_PORT")
	if !ok {
		log.Warn("DB_PORT is not set in .env! Using default value.")
		dbPort = "5432"
	}
	dbUser, ok := os.LookupEnv("DB_USER")
	if !ok {
		log.Fatal("DB_USER is not set in .env!")
	}
	dbPassword, ok := os.LookupEnv("DB_PASSWORD")
	if !ok {
		log.Warn("DB_PASSWORD is not set in .env!")
	}
	dbName, ok := os.LookupEnv("DB_NAME")
	if !ok {
		log.Warn("DB_NAME is not set in .env! Using default value.")
		dbName = "stockviewer"
	}
	var err error
	db, err = sql.Open("postgres", fmt.Sprintf("host=%v port=%v user=%v password=%v dbname=%v sslmode=disable", dbHost, dbPort, dbUser, dbPassword, dbName))
	if err != nil {
		log.Fatal(err)
	}
	row := db.QueryRow("SELECT version()")

	var v string
	err = row.Scan(&v)
	if err != nil {
		log.Error(err)
	}
	log.Debug(v)
}

var wg sync.WaitGroup

func InitialiseDB() {
	log.Info("Initialising the database")
	db := getDB()

	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS "stocks" (
	"id"	SERIAL PRIMARY KEY NOT NULL UNIQUE,
	"name"	VARCHAR(32) NOT NULL,
	"latestUpdate"	TIMESTAMPTZ NOT NULL,
	"status" INTEGER DEFAULT 1
);`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "stockprice" (
	"stockid"	INTEGER NOT NULL,
	"price"	BIGINT NOT NULL,
	"timestamp"	TIMESTAMPTZ NOT NULL,
	CONSTRAINT "fk_stockid" FOREIGN KEY("stockid") REFERENCES stocks(id) ON DELETE CASCADE
)WITH (
  timescaledb.hypertable,
  timescaledb.partition_column='timestamp',
  timescaledb.segmentby='stockid'
);`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "users" (
	"id"	VARCHAR(36) NOT NULL PRIMARY KEY UNIQUE,
	"name"	VARCHAR(32) NOT NULL UNIQUE,
	"created"	TIMESTAMPTZ NOT NULL,
	"password" TEXT NOT NULL,
	"status" INTEGER DEFAULT 1);`)
	if err != nil {
		log.Fatal(err)
	}

	wg.Add(1)
	go createIndex("users", "name")

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "permissions" (
	"id"	SERIAL NOT NULL PRIMARY KEY UNIQUE,
	"userid"	VARCHAR(36) NOT NULL,
	"claimType" VARCHAR(64) NOT NULL,
	"claimValue" INTEGER NOT NULL,
	CONSTRAINT "fk_permissions_userid" FOREIGN KEY("userid") REFERENCES users("id") ON DELETE CASCADE);`)
	if err != nil {
		log.Fatal(err)
	}

	wg.Add(1)
	go createIndex("permissions", "userid")

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "sessions" (
    "id" UUID NOT NULL PRIMARY KEY UNIQUE,
	"token"	TEXT NOT NULL UNIQUE,
	"lastUsage" TIMESTAMPTZ NOT NULL,
	"expireDate" TIMESTAMPTZ NOT NULL,
	"userid" VARCHAR(36) NOT NULL,
	"useragent" TEXT,
	CONSTRAINT "fk_sessions_userid" FOREIGN KEY("userid") REFERENCES users("id") ON DELETE CASCADE);`)
	if err != nil {
		log.Fatal(err)
	}

	wg.Add(1)
	go createIndex("sessions", "token")

	wg.Wait()

	resp := db.QueryRow(`SELECT name FROM users LIMIT 1;`)
	var price string
	err = resp.Scan(&price)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.Debug("No Users found in users table")
			createAdminUser()
		} else {
			log.Fatal(err)
		}
	}
}

func createIndex(table string, row string) {
	statement := fmt.Sprintf("CREATE INDEX IF NOT EXISTS idx_%v_%v ON %v(%v);", table, row, table, row)
	_, err := db.Exec(statement)
	if err != nil {
		log.Fatal(err)
	}
	wg.Done()
}
