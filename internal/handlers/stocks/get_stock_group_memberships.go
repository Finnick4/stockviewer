package stocks

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

func GetStockGroupMembership(w http.ResponseWriter, r *http.Request) {
	stockID, err := strconv.Atoi(chi.URLParam(r, "stockID"))

	if err != nil || stockID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	log.Debugf("Getting all groups stock %v is a member of", stockID)

	if int32(stockID) <= 0 {
		log.Debugf("Invalid stock ID %v", int32(stockID))
		api.RequestMalformedHandler(w, fmt.Sprintf("Invalid stock ID %v", int32(stockID)))
		return
	}

	data, err := database.GetAllGroupsWithMemberStockID(int32(stockID))
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
