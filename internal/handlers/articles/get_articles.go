package articles

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func GetArticles(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting articles")

	var params = api.ArticleGetParams{}

	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if params.Offset < 0 {
		log.Debugf("Cannot get articles with offset %v", params.Offset)
		api.RequestMalformedHandler(w, fmt.Sprintf("Cannot get articles with offset %v", params.Offset))
		return
	}
	if params.Id < 0 {
		log.Debugf("Cannot get article with id %v", params.Id)
		api.RequestMalformedHandler(w, fmt.Sprintf("Cannot get article with id %v", params.Id))
		return
	}

	if params.Id > 0 {
		data, err := database.GetArticle(params.Id)
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
		return
	}

	if params.Offset >= 0 {
		data, err := database.GetArticles(params.Offset)
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
		return
	}

	api.RequestMalformedHandler(w, "Could not guess what to do with request.")
}
