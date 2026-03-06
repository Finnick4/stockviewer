package articles

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"stockviewer/internal/utilities"

	log "github.com/sirupsen/logrus"
)

func EditArticle(w http.ResponseWriter, r *http.Request) {
	log.Debug("Trying to edit an article")

	token := r.Context().Value("token").(string)

	if !database.HasTokenPermission(token, "canEditArticles") {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	var params = database.DetailedArticle{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	titlelen := utilities.CharCount(params.Title)
	if titlelen > 96 || titlelen < 10 {
		log.Debugf("Could not edit article as there was an issue with the title! Length is %v", titlelen)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not edit article as there was an issue with the title! Length is %v", titlelen))
		return
	}

	if params.ID < 1 {
		log.Debugf("Could not edit article as the id %v is invalid!", params.ID)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not edit article as the id %v is invalid!", params.ID))
		return
	}

	err = database.EditArticle(params.ID, params.Title, params.Content)
	if err != nil {
		log.Error(err)
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
