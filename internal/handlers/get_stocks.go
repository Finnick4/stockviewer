package handlers

import (
	"encoding/json"
	"net/http"
	"stockviewer/internal/database"

	"stockviewer/api"

	_ "github.com/glebarez/go-sqlite"

	log "github.com/sirupsen/logrus"
)

func GetStocks(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Inquiring all stocks")

	data, err := database.GetCurrentStocksSnapshot()

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
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
