package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"stockviewer/api"
	"stockviewer/internal/database"

	_ "github.com/glebarez/go-sqlite"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func CreateStock(w http.ResponseWriter, r *http.Request) {
	t := time.Now()
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
	if params.Name == "" || strings.Count(params.Name, "") >= 33 || params.InitPrice <= 0 {
		log.Debugf("Could not accept the request as at least one parameter is invalid (Either the name is missing or too long or the initial price is nonexistent or <= 0): name='%v', initprice=%v", params.Name, params.InitPrice)
		api.RequestMalformedHandler(w, "Could not process the request as the parameters are malformed: Either the name is missing or too long or the initial price is nonexistent or <= 0")
		return
	}

	lastID, err := database.CreateStock(params.Name, params.InitPrice)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

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
	log.Debugf("Time took to create stock was %v", time.Since(t))
}
