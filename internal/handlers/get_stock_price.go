package handlers

import (
	"encoding/json"
	"net/http"

	"stockviewer/api"

	"database/sql"

	_ "github.com/glebarez/go-sqlite"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func GetStockPrice(w http.ResponseWriter, r *http.Request) {
	var params = api.StockGetPriceParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	log.Debugf("Inquiring current stock value of id=%v", params.ID)

	if params.ID == 0 {
		log.Debugf("Request without an ID (id=%v), as such rejected the request", params.ID)
		api.RequestMalformedHandler(w, "Could not process the request as it is missing an ID to lookup!")
		return
	}

	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	resp := db.QueryRow(`SELECT price FROM stockprice WHERE stockid=? AND timestamp=(SELECT latestUpdate FROM stocks WHERE id=?);`, params.ID, params.ID)
	var price float64
	err = resp.Scan(&price)

	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			log.Debugf("No rows found for the given ID (id=%v)", params.ID)
			api.RequestNothingFoundHandler(w, "Could not find a stock with the provided id")
			return
		}
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	var response = api.StockGetPriceResponse{
		Code:  http.StatusOK,
		Price: price,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
