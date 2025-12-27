package main

import (
	"database/sql"
	"net/http"
	"stockviewer/internal/handlers"
	"stockviewer/internal/stocks"
	"time"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func main() {
	//log.SetLevel(log.DebugLevel)
	log.SetReportCaller(true)
	var r *chi.Mux = chi.NewRouter()
	handlers.Handler(r)

	log.Info("Initialising the database")
	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "stocks" (
	"id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	"latestUpdate"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
)`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS "stockprice" (
	"stockid"	INTEGER NOT NULL,
	"price"	REAL NOT NULL,
	"timestamp"	INTEGER NOT NULL,
	FOREIGN KEY("stockid") REFERENCES "stocks"("id")
)`)
	if err != nil {
		log.Fatal(err)
	}

	// action loops
	go func() {
		log.Info("Started Stepper Loop")
		// stepper
		for {
			log.Debug("Initialising one step")
			go func() {
				stocks.Step()
			}()
			time.Sleep(time.Duration(60) * time.Second)
		}
	}()

	log.Info("Starting GO API service...")

	err = http.ListenAndServe("localhost:8000", r)

	if err != nil {
		log.Fatal(err)
	}
}
