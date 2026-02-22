package stockgroups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"stockviewer/internal/utilities"

	log "github.com/sirupsen/logrus"
)

func CreateStockGroup(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Stock creation is in progress")

	token := r.Context().Value("token").(string)

	if !database.HasTokenPermission(token, "canCreateStockGroups") {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	var params = api.StockGroupCreateParams{}

	// get parameters
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if utilities.CharCount(params.Name) < 2 || utilities.CharCount(params.Name) > 32 {
		api.RequestMalformedHandler(w, fmt.Sprintf("The name can't be processed as it is %v chars long!", utilities.CharCount(params.Name)))
		log.Debug(params.Name)
		log.Debugf("The name can't be processed as it is %v chars long!", utilities.CharCount(params.Name))
		return
	}

	if !database.AreActiveStockIDs(params.Members) {
		log.Debug("One of the stocks to be added to the group is invalid.")
		api.RequestMalformedHandler(w, "One of the stocks to be added to the group is invalid.")
		return
	}

	userID := database.GetUserIDFromToken(token)

	groupID, err := database.CreateStockGroup(params.Name, userID)

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if len(params.Members) == 1 {
		err = database.AddStockToGroup(groupID, params.Members[0], userID)
	}
	if len(params.Members) > 1 {
		err = database.AddStocksToGroup(groupID, params.Members, userID)
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: groupID,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
