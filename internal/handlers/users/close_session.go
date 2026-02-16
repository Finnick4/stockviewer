package users

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"

	log "github.com/sirupsen/logrus"
)

func CloseSession(w http.ResponseWriter, r *http.Request) {
	log.Debug("Deleting token")
	token := r.Context().Value("token").(string)

	database.RemoveToken(token)

	cookieToken := http.Cookie{
		Name:     "token",
		Value:    "empty",
		Path:     "/",
		MaxAge:   -1,
		Secure:   false, // TODO This is currently only a development environment. Down the road, a toggle to switch to a production environment has to be implemented to i.e. set secure = true.
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, &cookieToken)

	cookieIsLoggedIn := http.Cookie{
		Name:     "isLoggedIn",
		Value:    "false",
		Path:     "/",
		MaxAge:   -1,
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
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
