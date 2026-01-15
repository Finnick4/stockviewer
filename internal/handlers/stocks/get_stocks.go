package stocks

import (
	"database/sql"
	"encoding/json"
	"errors"
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
	log.Debugf("Inquiring stocks")
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

	if params.ID > 0 {
		if database.IsValidTimeframeScope(params.Timeframe) {
			err = sendStockHistory(w, params.ID, params.Timeframe)
			log.Debugf("Time took to get stock %v with history in timeframe %v is %v", params.ID, params.Timeframe, time.Since(t))
		} else {
			err = sendStockInfo(w, params.ID)
			log.Debugf("Time took to get stock %v is %v", params.ID, time.Since(t))
		}
	} else {
		if database.IsValidTimeframeScope(params.Timeframe) {
			err = sendAllStockDeltas(w, params.Timeframe)
			log.Debugf("Time took to get all stocks with deltas is %v", time.Since(t))
		} else {
			err = sendAllStocks(w)
			log.Debugf("Time took to get all stocks is %v", time.Since(t))
		}
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.Debug("No rows found in query. Thus the given ID is invalid")
			api.RequestNothingFoundHandler(w, "Couldn't find a stock with the given ID.")
			return
		}
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}

func sendAllStockDeltas(w http.ResponseWriter, timeframeScope int64) error {
	log.Debugf("Getting stocks and deltas in timeframe %v", timeframeScope)
	deltas, err := database.GetStocksPriceDelta()
	if err != nil {
		return err
	}

	var response = api.StockGetResponse{
		Code: http.StatusOK,
		Data: deltas,
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(response)
}

func sendAllStocks(w http.ResponseWriter) error {
	log.Debug("Getting all current stock data")
	data, err := database.GetCurrentStockInformation()

	if err != nil {
		return err
	}

	var response = api.StockGetResponse{
		Code: http.StatusOK,
		Data: data,
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(response)
}

func sendStockHistory(w http.ResponseWriter, id int64, timeframeScope int64) error {
	history, err := database.GetStockPriceHistory(id, database.GenerateTimeframe(timeframeScope))
	if err != nil {
		return err
	}

	var response = api.StockGetResponse{
		Code: http.StatusOK,
		Data: history,
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(response)
}

func sendStockInfo(w http.ResponseWriter, id int64) error {
	price, err := database.GetStockPrice(id)

	if err != nil {
		return err
	}

	var response = api.StockGetResponse{
		Code: http.StatusOK,
		Data: price,
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(response)
}
