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

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")

	if userID == "" {
		api.RequestMalformedHandler(w, "Could not parse user ID.")
		return
	}

	permissions := r.Context().Value("permissions").(map[string]int32)

	if permissions["canDeleteUsers"] != 1 {
		api.InsufficientPermissionHandler(w)
		return
	}

	var params = dto.UserDeleteParams{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	token := r.Context().Value("token").(string)
	issuerUserTag := database.GetUserTagFromToken(token)

	if !database.IsCorrectPassword(issuerUserTag, params.Password) {
		api.RequestUnauthorisedHandler(w)
		return
	}

	log.Debugf("Trying to delete user %v", userID)

	err = database.DeleteUser(userID)

	if err != nil {
		api.InternalErrorHandler(w)
		log.Error(err)
		return
	}

	go func() {
		issuerUserID := database.GetUserIDFromToken(token)
		database.LogUserChange(userID, issuerUserID, 7, "deleted")
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
