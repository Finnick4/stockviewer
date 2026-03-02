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

func EditStock(w http.ResponseWriter, r *http.Request) {
	log.Debug("Trying to edit a stock group")

	token := r.Context().Value("token").(string)

	editNamePerm := database.HasTokenPermission(token, "canEditStockGroupNames")
	editDescriptionPerm := database.HasTokenPermission(token, "canEditStockGroupDescriptions")
	editMembersPerm := database.HasTokenPermission(token, "canEditStockGroupMembers")

	if !editNamePerm && !editDescriptionPerm && !editMembersPerm {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	var params = api.StockGroupEditParams{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	log.Debug(params)

	aimName := utilities.CharCount(params.Name) > 2 && utilities.CharCount(params.Name) <= 32
	aimDescription := params.Description != ""
	aimAddMembers := len(params.AddedMembers) != 0
	aimRemoveMembers := len(params.RemovedMembers) != 0

	if !(aimName || aimDescription || aimAddMembers || aimRemoveMembers) {
		api.RequestMalformedHandler(w, "Did not know what to do with request.")
		log.Debug("Did not know what to do with edit stock group request.")
		return
	}

	if aimName && !editNamePerm {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}
	if aimDescription && !editDescriptionPerm {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}
	if (aimAddMembers || aimRemoveMembers) && !editMembersPerm {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	if params.ID <= 0 {
		log.Debugf("Could not edit stock group %v as the id is invalid", params.ID)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not edit stock group %v as the id is invalid", params.ID))
		return
	}

	if !database.AreActiveStockIDs(append(params.AddedMembers, params.AddedMembers...)) {
		log.Debug("One of the stocks to be added or removed to or from the group is invalid.")
		api.RequestMalformedHandler(w, "One of the stocks to be added or removed to or from the group is invalid.")
		return
	}

	namelen := utilities.CharCount(params.Name)
	if aimName && (namelen < 2 || namelen > 32) {
		log.Debugf("Could not edit stock as there was an issue with the name! Length is %v", namelen)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not stock name as there was an issue with the name! Length is %v", namelen))
		return
	}

	userID := database.GetUserIDFromToken(token)

	if aimName {
		err = database.SetStockGroupName(params.ID, params.Name)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
	}
	if aimDescription {
		err = database.SetStockGroupDescription(params.ID, params.Description)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
	}
	if aimAddMembers {
		if len(params.AddedMembers) == 1 {
			err = database.AddStockToGroup(params.ID, params.AddedMembers[0], userID)
		}
		if len(params.AddedMembers) > 1 {
			err = database.AddStocksToGroup(params.ID, params.AddedMembers, userID)
		}
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
	}
	if aimRemoveMembers {
		if len(params.RemovedMembers) == 1 {
			err = database.RemoveStockFromGroup(params.ID, params.RemovedMembers[0])
		}
		if len(params.RemovedMembers) > 1 {
			err = database.RemoveStocksFromGroup(params.ID, params.RemovedMembers)
		}
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
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
