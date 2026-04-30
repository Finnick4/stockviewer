package stockgroups

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"

	log "github.com/sirupsen/logrus"
)

func GetStockGroups(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting stock groups")

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	log.Debug("Getting all stock groups")
	data, err := database.GetAllStockGroups(userID)
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
