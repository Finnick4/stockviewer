package sessions

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"strings"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func LoginSession(w http.ResponseWriter, r *http.Request) {
	var params = api.SessionLoginParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if params.Username == "" || params.Password == "" {
		log.Debugf("Could not process login as at least one of the parameters is empty.")
		api.RequestMalformedHandler(w, "Could not process login as at least one of the parameters is empty.")
		return
	}

	if strings.Count(params.Username, "") >= 33 || strings.Count(params.Password, "") >= 73 {
		log.Debugf("Could not process login as at least one of the parameters is too long.")
		api.RequestMalformedHandler(w, "Could not process login as at least one of the parameters is too long.")
		return
	}

	if !database.IsCorrectPassword(params.Username, params.Password) {
		api.RequestUnauthorisedHandler(w)
		return
	}

	id := database.GetIDFromName(params.Username)
	if id == "" {
		api.InternalErrorHandler(w)
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
