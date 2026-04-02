package stockgroups

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"strconv"

	_ "github.com/glebarez/go-sqlite"
	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func GetUnreadInfluences(w http.ResponseWriter, r *http.Request) {
	groupID, err := strconv.Atoi(chi.URLParam(r, "groupID"))

	if err != nil {
		api.RequestMalformedHandler(w, "Could not parse group ID!")
		return
	}

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	log.Debugf("Getting unread influences of group %v", groupID)

	influences, err := database.GetActiveUnreadInfluencesOnStockGroup(userID, int32(groupID))
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: influences,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
