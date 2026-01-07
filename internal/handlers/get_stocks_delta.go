package handlers

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"time"

	log "github.com/sirupsen/logrus"
)

func GetStocksDelta(w http.ResponseWriter, r *http.Request) {
	t := time.Now()

	deltas, err := database.GetStocksPriceDelta()
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	var response = api.StockGetDeltasResponse{
		Code:   http.StatusOK,
		Deltas: deltas,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
	log.Debugf("Time took to get all deltas: %v", time.Since(t))
}
