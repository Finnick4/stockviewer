package main

import (
	"fmt"
	"net/http"
	"os"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"stockviewer/internal/handlers"
	"stockviewer/internal/stocks"
	"strconv"
	"time"

	"github.com/joho/godotenv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

var HttpsMode bool

func main() {
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

	port, ok := os.LookupEnv("PORT")
	if !ok {
		log.Warn("PORT is not set in .env! Using default value.")
		port = "8000"
	}

	detailLevel, ok := os.LookupEnv("MAX_HISTORY_DETAIL")
	if !ok {
		log.Warn("MAX_HISTORY_DETAIL is not set in .env! Using default value.")
		detailLevel = "30"
	}

	lvlInt, err := strconv.Atoi(detailLevel)

	if err != nil {
		log.Fatal("Failed to parse MAX_HISTORY_DETAIL from .env!")
	}
	if lvlInt <= 0 {
		log.Fatal("Invalid environment variable MAX_HISTORY_DETAIL! This has to be at least 1 or greater!")
	}
	if lvlInt > 120 {
		log.Warnf("Environment variable MAX_HISTORY_DETAIL of %v exceeds 120!", lvlInt)
	}
	dto.MaxDetailLevel = int64(lvlInt)

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

	err = http.ListenAndServe(fmt.Sprintf(":%v", port), r)

	if err != nil {
		log.Fatal(err)
	}
}
