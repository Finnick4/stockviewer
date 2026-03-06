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

func CreateArticle(w http.ResponseWriter, r *http.Request) {
	log.Debugf("DetailedArticle creation is in progress")

	token := r.Context().Value("token").(string)

	if !database.HasTokenPermission(token, "canCreateArticles") {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	var params = api.ArticleCreateParams{}

	// get parameters
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	titlelen := utilities.CharCount(params.Title)
	if titlelen > 96 || titlelen < 10 {
		log.Debugf("Could not create article as there was an issue with the title! Length is %v", titlelen)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not create article as there was an issue with the title! Length is %v", titlelen))
		return
	}

	id, err := database.CreateArticle(params.Title, params.Content, database.GetUserIDFromToken(token))

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: id,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
