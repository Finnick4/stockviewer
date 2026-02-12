package users

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"stockviewer/internal/utilities"

	log "github.com/sirupsen/logrus"
)

func CreateUser(w http.ResponseWriter, r *http.Request) {
	log.Debug("Trying to create a user")

	token := r.Context().Value("token").(string)

	if !database.HasTokenPermission(token, "canCreateUsers") {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	var params = api.UserCreateParams{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if !utilities.IsPlausibleUserTag(params.Tag) {
		log.Debugf("Could not process creating an account as the tag is not plausible.")
		api.RequestMalformedHandler(w, "Could not process creating an account as the tag is not plausible.")
		return
	}

	if !utilities.IsPlausiblePassword(params.Password) {
		log.Debugf("Could not process creating an account as the provided password is not plausible.")
		api.RequestMalformedHandler(w, "Could not creating an account as the provided password is not plausible.")
		return
	}

	creatorid := database.GetUserIDFromToken(token)

	err = database.CreateUser(params.Tag, params.Password, creatorid)

	if err != nil {
		api.InternalErrorHandler(w)
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
