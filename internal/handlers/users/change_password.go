package users

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"stockviewer/internal/utilities"

	log "github.com/sirupsen/logrus"
)

func ChangePassword(w http.ResponseWriter, r *http.Request) {
	log.Debug("Trying to change PW")
	var params = dto.UserChangePasswordParams{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if !utilities.IsPlausibleUserTag(params.Tag) {
		log.Debugf("Could not process changing the password as the tag is not plausible.")
		api.RequestMalformedHandler(w, "Could not process changing the password as the tag is not plausible.")
		return
	}

	if !utilities.IsPlausiblePassword(params.OldPassword) {
		log.Debugf("Could not process changing the password as the old provided password is not plausible.")
		api.RequestMalformedHandler(w, "Could not process changing the old password as the provided password is not plausible.")
		return
	}

	if !utilities.IsPlausiblePassword(params.NewPassword) {
		log.Debugf("Could not process changing the password as the new password is invalid.")
		api.RequestMalformedHandler(w, "Could not process changing the password as the new password is invalid.")
		return
	}

	if !database.IsCorrectPassword(params.Tag, params.OldPassword) {
		api.RequestUnauthorisedHandler(w)
		return
	}

	id := database.GetUserIDFromTag(params.Tag)
	if id == "" {
		api.InternalErrorHandler(w)
		return
	}

	err = database.EditPasswordFromUserID(id, params.NewPassword)

	if err != nil {
		api.InternalErrorHandler(w)
		return
	}

	go database.LogUserChange(id, id, 4, "")
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
