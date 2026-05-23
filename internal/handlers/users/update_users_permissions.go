package users

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func UpdateUsersPermission(w http.ResponseWriter, r *http.Request) {
	permissions := r.Context().Value("permissions").(map[string]int32)

	if permissions["canEditUserPermissions"] != 1 {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	userID := chi.URLParam(r, "userID")

	if userID == "" {
		api.RequestMalformedHandler(w, "Could not parse user ID.")
		return
	}

	token := r.Context().Value("token").(string)
	issuerID := database.GetUserIDFromToken(token)

	if userID == issuerID {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor cannot affect oneself.")
		return
	}

	var params = dto.UserEditPermissionsParams{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.RequestMalformedHandler(w, "Could not decode the body")
		log.Error(err)
		return
	}

	for _, perm := range params.Permissions {
		if permissions[perm.Permission] == 0 {
			api.InsufficientPermissionHandler(w)
			log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
			return
		}
	}
	err = database.SetUserPermissions(userID, params.Permissions)

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	go func() {
		entries := make([]dto.UserLogEntry, len(params.Permissions))

		for i, perm := range params.Permissions {
			marshalled, err := json.Marshal(perm)
			if err != nil {
				log.Errorf("Encountered an issue while marshalling changed permission (%v) for logging editing of said permission on user (%v)!", perm, userID)
				log.Error(err)
				return
			}
			entries[i] = dto.UserLogEntry{
				TargetUserID: userID,
				IssuerUserID: issuerID,
				ActionType:   6,
				Change:       string(marshalled),
			}
		}
		database.LogUserChanges(entries)
	}()

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
