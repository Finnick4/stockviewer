package handlers

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

func GetStockPrice(w http.ResponseWriter, r *http.Request) {
	t := time.Now()
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

	if params.ID <= 0 {
		log.Debugf("Request without an ID (id=%v), as such rejected the request", params.ID)
		api.RequestMalformedHandler(w, "Could not process the request as it is missing an ID to lookup!")
		return
	}

	price, err := database.GetStockPrice(params.ID)

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
	log.Debugf("Time took to get a stock price was %v", time.Since(t))
}
