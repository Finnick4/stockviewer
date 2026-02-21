package stockgroups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func GetStockGroup(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting stock group")

	var params = api.StockGroupGetParams{}

	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if params.ID < 0 {
		log.Debugf("Cannot get stock group with id %v", params.ID)
		api.RequestMalformedHandler(w, fmt.Sprintf("Cannot get stock group with id %v", params.ID))
		return
	}

	for _, member := range params.Members {
		if member < 0 {
			log.Debugf("Stock ID %v is invalid. As such cannot get anonymous stock group.", member)
			api.RequestMalformedHandler(w, fmt.Sprintf("Stock ID %v is invalid. As such cannot get anonymous stock group.", member))
			return
		}
	}

	if params.ID > 0 {
		data, err := database.GetDetailedStockGroup(params.ID)
		if err != nil {
			api.InternalErrorHandler(w)
			log.Debug(err)
			return
		}

		var response = api.SuccessResponse{
			Code: http.StatusOK,
			Data: data,
		}

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			api.InternalErrorHandler(w)
			log.Debug(err)
			return
		}
		return
	}

	if params.ID == 0 && len(params.Members) != 0 {
		log.Debug("Getting anonymous stock group")
		data, err := database.GetAnonymousStockGroup(params.Members)
		if err != nil {
			api.InternalErrorHandler(w)
			log.Debug(err)
			return
		}

		var response = api.SuccessResponse{
			Code: http.StatusOK,
			Data: data,
		}

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			api.InternalErrorHandler(w)
			log.Debug(err)
			return
		}
		return
	}

	log.Debug("Getting all stock groups")
	data, err := database.GetAllStockGroups()
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: data,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}
	return
}
