package stockgroups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"stockviewer/internal/utilities"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func CreateStockGroup(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Stock creation is in progress")

	token := r.Context().Value("token").(string)
	permissions := r.Context().Value("permissions").(map[string]int32)

	if permissions["canCreateStockGroups"] != 1 {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	var params = dto.StockGroupCreateParams{}

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

	groupID, err := database.CreateStockGroup(params.Name, params.Description, userID)

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	go func() {
		group := dto.LoggedStockGroup{
			Name:        params.Name,
			Description: params.Description,
		}
		marshalled, err := json.Marshal(group)
		if err != nil {
			log.Error("Encountered issue while marshalling stock group for logging the creation of said group!")
			log.Error(err)
			return
		}
		database.LogStockGroupChange(groupID, userID, 1, string(marshalled))
	}()

	if len(params.Members) == 1 {
		err = database.AddStockToGroup(groupID, params.Members[0], userID)
	}
	if len(params.Members) > 1 {
		err = database.AddStocksToGroup(groupID, params.Members, userID)
	}

	if err != nil {
		log.Error("Encountered issue while trying to add stock(s) to newly created group!")
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	go func() {
		entries := make([]dto.StockGroupLogEntry, len(params.Members))

		for i, member := range params.Members {
			entries[i] = dto.StockGroupLogEntry{
				StockGroupID: groupID,
				UserID:       userID,
				ActionType:   4,
				Change:       strconv.Itoa(int(member)),
			}
		}
		database.LogStockGroupChanges(entries)
	}()

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
