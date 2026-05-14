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

func GetStockAnonymousGroup(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting anonymous stock group")

	var params = dto.AnonymousStockGroupGetParams{}

	var decoder *schema.Decoder = schema.NewDecoder()

	// get parameters
	err := decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if len(params.Members) == 0 {
		log.Debug("There are no members for the anonymous stock group!")
		var data any
		if dto.IsValidTimeframeLength(params.Timeframe) {
			data = nil
		} else {
			data = dto.DetailedStockGroup{}
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

	if !database.AreActiveStockIDs(params.Members) {
		log.Debug("One of the stocks to be queried is invalid.")
		api.RequestMalformedHandler(w, "One of the stocks to be queried is invalid.")
		return
	}

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	if dto.IsValidTimeframeLength(params.Timeframe) {
		data, err := database.GetAnonymousStockGroupHistory(params.Members, dto.GenerateTimeframe(params.Timeframe))

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

	data, err := database.GetAnonymousStockGroup(params.Members, userID)
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
