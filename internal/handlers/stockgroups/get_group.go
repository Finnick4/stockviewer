package stockgroups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"strconv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func GetStockGroup(w http.ResponseWriter, r *http.Request) {
	groupID, err := strconv.Atoi(chi.URLParam(r, "groupID"))

	if err != nil {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	log.Debugf("Getting stock group %v", groupID)

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	if int32(groupID) < -1 {
		log.Debugf("Cannot get stock group with id %v", int32(groupID))
		api.RequestMalformedHandler(w, fmt.Sprintf("Cannot get stock group with id %v", int32(groupID)))
		return
	}

	if int32(groupID) > 0 || int32(groupID) == -1 {
		data, err := database.GetDetailedStockGroup(userID, int32(groupID))
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

	api.RequestMalformedHandler(w, "The provided ID is invalid.")
}
