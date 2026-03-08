package database

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"strings"
	"sync"

	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
)

var databaseConnection *sql.DB

func getDB() *sql.DB {
	if databaseConnection == nil {
		log.Debug("Connecting to DB")
		connectToDB()
	}
	return databaseConnection
}

func CloseDB() {
	err := databaseConnection.Close()
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
	databaseConnection, err = sql.Open("postgres", fmt.Sprintf("host=%v port=%v user=%v password=%v dbname=%v sslmode=disable", dbHost, dbPort, dbUser, dbPassword, dbName))
	if err != nil {
		log.Fatal(err)
	}
	row := databaseConnection.QueryRow("SELECT version()")

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

	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS "users" (
	"id"	VARCHAR(36) NOT NULL PRIMARY KEY UNIQUE,
	"tag"	VARCHAR(32) NOT NULL UNIQUE,
	"displayName"	VARCHAR(32) NOT NULL,
	"created"	TIMESTAMPTZ NOT NULL,
	"password" TEXT NOT NULL,
	"status" INTEGER DEFAULT 1,
	"creatorId" VARCHAR(36),
	CONSTRAINT "fk_users_creator" FOREIGN KEY("creatorId") REFERENCES users("id") ON DELETE SET NULL);`)
	if err != nil {
		log.Fatal(err)
	}

	wg.Add(1)
	go createIndex("users", "tag")

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "stocks" (
	"id"	SERIAL PRIMARY KEY NOT NULL UNIQUE,
	"name"	VARCHAR(32) NOT NULL,
	"shorthand" VARCHAR(5) NOT NULL UNIQUE,
	"latestUpdate"	TIMESTAMPTZ NOT NULL,
	"status" INTEGER DEFAULT 1,
	"creatorId" VARCHAR(36),
	"color" INTEGER,
	CONSTRAINT "fk_stocks_creator" FOREIGN KEY("creatorId") REFERENCES users("id") ON DELETE SET NULL);`)
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

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "articles" (
	"id"	SERIAL NOT NULL PRIMARY KEY UNIQUE,
	"creatorId"	VARCHAR(36),
	"title" VARCHAR(96) NOT NULL,
	"content" TEXT,
	"createdAt" TIMESTAMPTZ NOT NULL,
	CONSTRAINT "fk_articles_creatorid" FOREIGN KEY("creatorId") REFERENCES users("id") ON DELETE SET NULL);`)
	if err != nil {
		log.Fatal(err)
	}

	wg.Add(2)
	go createIndex("articles", "creatorId")
	go createIndex("articles", "title")

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "stockgroups" (
	"id"	SERIAL NOT NULL PRIMARY KEY UNIQUE,
	"name"	VARCHAR(32) NOT NULL,
	"description" TEXT,
	"creatorId" VARCHAR(36),
	CONSTRAINT "fk_stockgroups_creator" FOREIGN KEY("creatorId") REFERENCES users("id") ON DELETE SET NULL);`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "stockgroupmembers" (
	"groupId"	INTEGER NOT NULL,
	"stockId"	INTEGER NOT NULL,
	"creatorId" VARCHAR(36),
	PRIMARY KEY ("groupId", "stockId"),
	CONSTRAINT "fk_stockgroupmembers_stocks" FOREIGN KEY("stockId") REFERENCES stocks("id") ON DELETE CASCADE,
	CONSTRAINT "fk_stockgroupmembers_group" FOREIGN KEY("groupId") REFERENCES stockgroups("id") ON DELETE CASCADE,
	CONSTRAINT "fk_stockgroupmembers_creator" FOREIGN KEY("creatorId") REFERENCES users("id") ON DELETE SET NULL);`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "starredstocks" (
	"stockId"	INTEGER NOT NULL,
	"userId"	VARCHAR(36) NOT NULL,
	PRIMARY KEY ("stockId", "userId"),
	CONSTRAINT "fk_starredstocks_stock" FOREIGN KEY("stockId") REFERENCES stocks("id") ON DELETE CASCADE,
    CONSTRAINT "fk_starredstocks_user" FOREIGN KEY("userId") REFERENCES users("id") ON DELETE CASCADE);`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "starredstockgroups" (
	"groupId"	INTEGER NOT NULL,
	"userId"	VARCHAR(36) NOT NULL,
	PRIMARY KEY ("groupId", "userId"),
	CONSTRAINT "fk_starredstockgroups_group" FOREIGN KEY("groupId") REFERENCES stockgroups("id") ON DELETE CASCADE,
	CONSTRAINT "fk_starredstockgroups_user" FOREIGN KEY("userId") REFERENCES users("id") ON DELETE CASCADE);`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "stockinfluences" (
	"stockId"	INTEGER NOT NULL,
	"articleId"	INTEGER NOT NULL,
	"creatorId"	VARCHAR(36) NOT NULL,
	"duration" INTEGER NOT NULL,
	"permille" REAL NOT NULL,
	"falloffType" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("stockId", "articleId"),
	CONSTRAINT "fk_stockinfluences_stockid" FOREIGN KEY("stockId") REFERENCES stocks("id") ON DELETE CASCADE,
	CONSTRAINT "fk_stockinfluences_articleid" FOREIGN KEY("articleId") REFERENCES articles("id") ON DELETE CASCADE,
	CONSTRAINT "fk_stockinfluences_creatorid" FOREIGN KEY("creatorId") REFERENCES users("id") ON DELETE SET NULL);`)
	if err != nil {
		log.Fatal(err)
	}

	wg.Wait()

	resp := db.QueryRow(`SELECT tag FROM users LIMIT 1;`)
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
	go resetAdminPermissions()
}

func createIndex(table string, row string) {
	db := getDB()
	statement := fmt.Sprintf(`CREATE INDEX IF NOT EXISTS idx_%v_%v ON %v("%v");`, strings.ToLower(table), strings.ToLower(row), table, row)
	_, err := db.Exec(statement)
	if err != nil {
		log.Error(statement)
		log.Fatal(err)
	}
	wg.Done()
}
