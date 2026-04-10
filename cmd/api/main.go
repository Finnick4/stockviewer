package main

import (
	"fmt"
	"net/http"
	"os"
	"stockviewer/internal/database"
	"stockviewer/internal/handlers"
	"stockviewer/internal/stocks"
	"time"

	"github.com/joho/godotenv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func main() {

	log.SetFormatter(&log.TextFormatter{
		ForceColors: true,
	})

	err := godotenv.Load(".env")

	if err != nil {
		log.Error("No .env file found!")
	}

	log_level, ok := os.LookupEnv("LOG_LEVEL")
	if !ok {
		log.Warn("LOG_LEVEL is not set in .env! Using default value.")
		log_level = "Info"
	}
	loglvl, err := log.ParseLevel(log_level)

	if err != nil {
		log.Warnf("LOG_LEVEL as defined in .env is not a valid log level!")
	} else {
		log.SetLevel(loglvl)
	}

	address, ok := os.LookupEnv("ADDRESS")
	if !ok {
		log.Warn("ADDRESS is not set in .env! Using default value.")
		address = "localhost"
	}
	port, ok := os.LookupEnv("PORT")
	if !ok {
		log.Warn("PORT is not set in .env! Using default value.")
		port = "8000"
	}

	log.SetReportCaller(true)
	var r *chi.Mux = chi.NewRouter()
	handlers.Handler(r)

	database.InitialiseDB()
	defer database.CloseDB()

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

	err = http.ListenAndServe(fmt.Sprintf("%v:%v", address, port), r)

	if err != nil {
		log.Fatal(err)
	}
}
