package users

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"strings"

	log "github.com/sirupsen/logrus"
)

func ChangePassword(w http.ResponseWriter, r *http.Request) {
	log.Debug("Trying to change PW")
	var params = api.UserChangePasswordParams{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if params.Username == "" || params.OldPassword == "" {
		log.Debugf("Could not process password change as at least one of the parameters is empty.")
		api.RequestMalformedHandler(w, "Could not process password change as at least one of the parameters is empty.")
		return
	}

	if params.NewPassword == "" {
		log.Debugf("Could not process password change as the new password would be empty.")
		api.RequestMalformedHandler(w, "Could not process password change as the new password may not be empty.")
		return
	}

	if strings.Count(params.Username, "") >= 33 || strings.Count(params.OldPassword, "") >= 73 || strings.Count(params.NewPassword, "") >= 73 {
		log.Debugf("Could not process password change as at least one of the parameters is too long.")
		api.RequestMalformedHandler(w, "Could not process password change as at least one of the parameters is too long.")
		return
	}

	if !database.IsCorrectPassword(params.Username, params.OldPassword) {
		api.RequestUnauthorisedHandler(w)
		return
	}

	id := database.GetUserIDFromName(params.Username)
	if id == "" {
		api.InternalErrorHandler(w)
		return
	}

	err = database.EditPasswordFromUserID(id, params.NewPassword)

	if err != nil {
		api.InternalErrorHandler(w)
		return
	}

	go database.RevokeAllTokensFromUserID(id)

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
