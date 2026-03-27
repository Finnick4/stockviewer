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

	go func() {
		userID := database.GetUserIDFromToken(r.Context().Value("token").(string))
		database.SetArticleAsViewedForUserID(int32(articleID), userID)
	}()

	data, err := database.GetArticle(int32(articleID))
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
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
