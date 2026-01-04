package handlers

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"time"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func GetStockHistory(w http.ResponseWriter, r *http.Request) {
	t := time.Now()
	var params = api.StockGetHistoryParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if params.Timeframe <= 0 || params.Timeframe > 4 {
		log.Debugf("Could not handle request due to invalid timeframe %v", params.Timeframe)
		api.RequestMalformedHandler(w, "Could not process the request as the parameters are malformed: The requested timeframe is invalid.")
		return
	}

	log.Debugf("Getting history of stock %v in timeframe %v", params.ID, params.Timeframe)

	history, err := database.GetStockPriceHistory(params.ID, params.Timeframe)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if len(history) == 0 {
		log.Debugf("As the DB response is empty there is no stock with the id %v", params.ID)
		api.RequestNothingFoundHandler(w, "Could not find a stock with the provided id")
		return
	}

	var response = api.StockGetHistoryResponse{
		Code:    http.StatusOK,
		History: history,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
	log.Debugf("Time took to get a history %v", time.Since(t))
}
