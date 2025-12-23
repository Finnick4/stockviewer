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

func GetStocks(w http.ResponseWriter, r *http.Request) {
	var params = api.StockGetParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	log.Debugf("Inquiring all stocks")

	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	rows, err := db.Query(`SELECT stocks.id, stocks.name, stockprice.price FROM stocks JOIN stockprice ON stocks.id = stockprice.stockid AND stockprice.timestamp=stocks.latestUpdate;`)

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
	defer rows.Close()

	var data []api.CurrentStockData

	for rows.Next() {
		var currentData api.CurrentStockData
		err = rows.Scan(&currentData.ID, &currentData.Name, &currentData.Price)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		data = append(data, currentData)
	}

	var response = api.StockGetResponse{
		Code: http.StatusOK,
		Data: data,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
