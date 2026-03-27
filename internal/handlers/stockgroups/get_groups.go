package stockgroups

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func GetStockGroups(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting stock groups")

	var params = dto.StockGroupGetParams{}

	var decoder *schema.Decoder = schema.NewDecoder()

	// get parameters
	err := decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if !database.AreActiveStockIDs(params.Members) {
		log.Debug("One of the stocks to be queried is invalid.")
		api.RequestMalformedHandler(w, "One of the stocks to be queried is invalid.")
		return
	}

	if len(params.Members) != 0 {
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
