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

func LoginSession(w http.ResponseWriter, r *http.Request) {
	var params = dto.UserLoginParams{}
	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if !utilities.IsPlausibleUserTag(params.Tag) {
		log.Debugf("Could not process login as at the tag is not plausible.")
		api.RequestMalformedHandler(w, "Could not process login as at the tag is not plausible.")
		return
	}

	if !utilities.IsPlausiblePassword(params.Password) {
		log.Debugf("Could not process login as at the provided password is not plausible.")
		api.RequestMalformedHandler(w, "Could not process login as at the provided password is not plausible.")
		return
	}

	if !database.IsCorrectPassword(params.Tag, params.Password) {
		api.RequestUnauthorisedHandler(w)
		return
	}

	id := database.GetUserIDFromTag(params.Tag)
	if id == "" {
		api.InternalErrorHandler(w)
		return
	}

	status := database.GetUserIDStatus(id)

	switch status {
	case 1:
		break
	case 2:
		api.PasswordChangeRequiredHandler(w)
		return
	default:
		api.RequestUnauthorisedHandler(w)
		return
	}

	token, err := database.GenerateNewToken(id)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	cookieToken := http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		MaxAge:   2592000,
		Secure:   false, // TODO This is currently only a development environment. Down the road, a toggle to switch to a production environment has to be implemented to i.e. set secure = true.
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, &cookieToken)

	cookieIsLoggedIn := http.Cookie{
		Name:     "isLoggedIn",
		Value:    "true",
		Path:     "/",
		MaxAge:   2592000,
		Secure:   false,
		HttpOnly: false,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, &cookieIsLoggedIn)

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
