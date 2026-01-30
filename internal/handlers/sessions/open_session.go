package sessions

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"strings"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func LoginSession(w http.ResponseWriter, r *http.Request) {
	var params = api.SessionLoginParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if params.Username == "" || params.Password == "" {
		log.Debugf("Could not process login as at least one of the parameters is empty.")
		api.RequestMalformedHandler(w, "Could not process login as at least one of the parameters is empty.")
		return
	}

	if strings.Count(params.Username, "") >= 33 || strings.Count(params.Password, "") >= 73 {
		log.Debugf("Could not process login as at least one of the parameters is too long.")
		api.RequestMalformedHandler(w, "Could not process login as at least one of the parameters is too long.")
		return
	}

	if database.IsCorrectPassword(params.Username, params.Password) {
		id := database.GetIDFromName(params.Username)
		if id == "" {
			api.InternalErrorHandler(w)
			return
		}

		token, err := database.GenerateNewToken(id)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}

		var response = api.SuccessResponse{
			Code: http.StatusOK,
			Data: token,
		}

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
	} else {
		api.RequestUnauthorisedHandler(w)
		return
	}
}
