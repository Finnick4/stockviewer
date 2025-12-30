package database

import (
	"database/sql"
	"fmt"
	"os"

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

func InitialiseDB() {
	log.Info("Initialising the database")
	db := getDB()
	log.Debug("Actually starting to initialise the database")
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS "stocks" (
	"id"	SERIAL PRIMARY KEY NOT NULL UNIQUE,
	"name"	VARCHAR(32) NOT NULL,
	"latestUpdate"	INTEGER NOT NULL
);`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "stockprice" (
	"stockid"	INTEGER NOT NULL,
	"price"	REAL NOT NULL,
	"timestamp"	INTEGER NOT NULL,
	CONSTRAINT "fk_stockid" FOREIGN KEY("stockid") REFERENCES stocks(id) ON DELETE CASCADE
);`)
	if err != nil {
		log.Fatal(err)
	}

}
