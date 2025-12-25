package handlers

import (
	"encoding/json"
	"net/http"
	"stockviewer/internal/database"

	"stockviewer/api"

	"database/sql"

	_ "github.com/glebarez/go-sqlite"

	log "github.com/sirupsen/logrus"
)

func GetStocks(w http.ResponseWriter, r *http.Request) {
	var err error

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

	var data []database.CurrentStockData

	for rows.Next() {
		var currentData database.CurrentStockData
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
