package stocks

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

func GetInfluences(w http.ResponseWriter, r *http.Request) {
	stockID, err := strconv.Atoi(chi.URLParam(r, "stockID"))

	if err != nil {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	log.Debugf("Getting all influences of stock %v", stockID)

	influences, err := database.GetActiveInfluencesOnStock(int32(stockID))
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
