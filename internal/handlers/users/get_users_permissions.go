package users

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func GetUsersPermission(w http.ResponseWriter, r *http.Request) {
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

	perms, err := database.GetAllUserIDPermissions(userID)

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: perms,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
