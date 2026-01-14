package stocks

import (
	"encoding/json"
	"net/http"
	"stockviewer/internal/database"
	"time"

	"stockviewer/api"

	_ "github.com/glebarez/go-sqlite"
	"github.com/gorilla/schema"

	log "github.com/sirupsen/logrus"
)

func GetStocks(w http.ResponseWriter, r *http.Request) {
	t := time.Now()
	log.Debugf("Inquiring all stocks")
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

	// TODO: Return history if a specific stock is requested

	if database.IsValidTimeframeScope(params.Timeframe) {
		log.Debugf("Getting stocks and deltas in timeframe %v", params.Timeframe)
		deltas, err := database.GetStocksPriceDelta()
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}

		var response = api.StockGetDeltasResponse{
			Code: http.StatusOK,
			Data: deltas,
		}

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		log.Debugf("Time took to get all stocks with price delta was %v", time.Since(t))
		return

	} else {
		log.Debug("Getting all current stock data")
		data, err := database.GetCurrentStockInformation()

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
		log.Debugf("Time took to get all stocks was %v", time.Since(t))
		return
	}
}
