package users

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"

	log "github.com/sirupsen/logrus"
)

func GetUserInformation(w http.ResponseWriter, r *http.Request) {
	token := r.Context().Value("token").(string)

	name := database.GetUserNameFromToken(token)

	if name == "" {
		api.InternalErrorHandler(w)
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: name,
	}

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
