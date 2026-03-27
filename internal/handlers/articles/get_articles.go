package articles

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func GetArticles(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting articles")

	var params = dto.ArticleGetParams{}

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

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	data, err := database.GetArticles(params.Offset, userID)
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
