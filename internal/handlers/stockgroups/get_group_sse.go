package stockgroups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"stockviewer/internal/handlers/sse"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func GetStockGroupSSE(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting stock group")

	var params = api.StockGroupGetParams{}

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if params.ID < -1 {
		log.Debugf("Cannot get stock group with id %v", params.ID)
		api.RequestMalformedHandler(w, fmt.Sprintf("Cannot get stock group with id %v", params.ID))
		return
	}

	if !database.AreActiveStockIDs(params.Members) {
		log.Debug("One of the stocks to be queried is invalid.")
		api.RequestMalformedHandler(w, "One of the stocks to be queried is invalid.")
		return
	}

	rc := http.NewResponseController(w)

	var send func() error

	if params.ID > 0 || params.ID == -1 {
		send = func() error {
			data, err := database.GetDetailedStockGroup(userID, params.ID)
			if err != nil {
				log.Debug(err)
				return err
			}

			resp, err := json.Marshal(data)
			if err != nil {
				return err
			}

			_, err = fmt.Fprintf(w, "event:stockupdate\ndata:%s\n\n", string(resp))
			if err != nil {
				return err
			}
			err = rc.Flush()
			return err
		}
	}

	if params.ID == 0 && len(params.Members) != 0 {
		send = func() error {
			log.Debug("Getting anonymous stock group")
			data, err := database.GetAnonymousStockGroup(params.Members)
			if err != nil {
				log.Debug(err)
				return err
			}

			resp, err := json.Marshal(data)
			if err != nil {
				return err
			}

			_, err = fmt.Fprintf(w, "event:stockupdate\ndata:%s\n\n", string(resp))
			if err != nil {
				return err
			}
			err = rc.Flush()
			return err
		}
	}

	if params.ID == 0 && len(params.Members) == 0 {
		send = func() error {
			log.Debug("Getting all stock groups")
			data, err := database.GetAllStockGroups()
			if err != nil {
				api.InternalErrorHandler(w)
				log.Debug(err)
				return err
			}

			resp, err := json.Marshal(data)
			if err != nil {
				return err
			}

			_, err = fmt.Fprintf(w, "event:stockupdate\ndata:%s\n\n", string(resp))
			if err != nil {
				return err
			}
			err = rc.Flush()
			return err
		}
	}

	sse.SendSSEOnStockGroupChange(w, r, send)
}
