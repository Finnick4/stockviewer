package stockgroups

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"strconv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func StarStockGroup(w http.ResponseWriter, r *http.Request) {
	groupID, err := strconv.Atoi(chi.URLParam(r, "groupID"))

	if err != nil || groupID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock group ID!")
		return
	}

	log.Debugf("Trying to star stock group %v", groupID)

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	var params = dto.StarParams{}

	defer r.Body.Close()

	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if !database.IsValidGroupID(int32(groupID)) {
		api.RequestMalformedHandler(w, "Cannot star invalid stock group id!")
		log.Debugf("Stock group id %v is invalid", int32(groupID))
		return
	}

	log.Debugf("User tries to star (%v) stock group id %v", params.Result, int32(groupID))

	if params.Result {
		err = database.StarStockGroupID(int32(groupID), userID)
	} else {
		err = database.UnstarStockGroupID(int32(groupID), userID)
	}

	if err != nil {
		api.InternalErrorHandler(w)
		log.Error(err)
		return
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: "success",
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
