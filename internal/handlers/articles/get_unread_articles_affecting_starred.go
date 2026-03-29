package articles

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"

	log "github.com/sirupsen/logrus"
)

func GetUnreadArticlesAffectingStarred(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting articles which affect starred stocks or stocks in starred stock groups")

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	data, err := database.GetUnreadArticlesActivelyAffectingStarredStocksAndStarredStockGroups(userID)
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
}
