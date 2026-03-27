package articles

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"strconv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func GetArticle(w http.ResponseWriter, r *http.Request) {
	articleID, err := strconv.Atoi(chi.URLParam(r, "articleID"))

	if err != nil {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	if int32(articleID) <= 0 {
		log.Debugf("Cannot get article with id %v", int32(articleID))
		api.RequestMalformedHandler(w, fmt.Sprintf("Cannot get article with id %v", int32(articleID)))
		return
	}

	log.Debugf("Getting article %v", articleID)

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	data, err := database.GetArticle(int32(articleID), userID)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if !data.Viewed {
		data.TotalViews++
		data.Viewed = true
		go database.SetArticleAsViewedForUserID(int32(articleID), userID)
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: data,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}
}
