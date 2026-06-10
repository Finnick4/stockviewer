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

func ChangeUserEnabledStatus(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")

	if userID == "" {
		api.RequestMalformedHandler(w, "Could not parse user ID.")
		return
	}

	permissions := r.Context().Value("permissions").(map[string]int32)

	if permissions["canDisableUsers"] != 1 {
		api.InsufficientPermissionHandler(w)
		return
	}

	var params = dto.DisableParams{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}
	log.Debugf("Trying to disable (%v) user %v", params.Result, userID)

	if params.Result {
		database.DisableUser(userID)
		go func() {
			token := r.Context().Value("token").(string)
			issuerUserID := database.GetUserIDFromToken(token)
			database.LogUserChange(userID, issuerUserID, 8, "disabled")
		}()
	} else {
		database.EnableUser(userID)
		go func() {
			token := r.Context().Value("token").(string)
			issuerUserID := database.GetUserIDFromToken(token)
			database.LogUserChange(userID, issuerUserID, 9, "enanbled")
		}()
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
