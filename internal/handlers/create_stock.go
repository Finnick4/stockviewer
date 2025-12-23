package handlers

import (
	"encoding/json"
	"net/http"

	"stockviewer/api"

	"database/sql"

	_ "github.com/glebarez/go-sqlite"

	"time"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func CreateStock(w http.ResponseWriter, r *http.Request) {
	var params = api.StockCreateParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	log.Debugf("Stock creation is in progress")

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
	currentTimeStamp := time.Now().Unix()

	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	resp, err := db.Exec(`INSERT INTO stocks (name, latestUpdate) VALUES (?, ?);`, params.Name, currentTimeStamp)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	lastID, err := resp.LastInsertId()

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	_, err = db.Exec(`INSERT INTO stockprice (stockid, price, timestamp) VALUES (?, ?, ?);`, lastID, params.InitPrice, currentTimeStamp)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	log.Debugf("Successfully created stock '%v' (id=%v) at t=%v with an initial value of %v\n", params.Name, lastID, currentTimeStamp, params.InitPrice)

	var response = api.CreateStockResponse{
		Code: http.StatusOK,
		ID:   lastID,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
