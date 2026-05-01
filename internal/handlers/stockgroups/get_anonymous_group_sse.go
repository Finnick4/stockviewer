package stockgroups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"stockviewer/internal/handlers/sse"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func GetStockAnonymousGroupSSE(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting anonymous stock group")

	var params = dto.AnonymousStockGroupGetParams{}

	var decoder *schema.Decoder = schema.NewDecoder()

	// get parameters
	err := decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if !database.AreActiveStockIDs(params.Members) {
		log.Debug("One of the stocks to be queried is invalid.")
		api.RequestMalformedHandler(w, "One of the stocks to be queried is invalid.")
		return
	}

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	rc := http.NewResponseController(w)

	var send func() error

	if dto.IsValidTimeframeLength(params.Timeframe) {
		send = func() error {
			data, err := database.GetAnonymousStockGroupHistory(params.Members, dto.GenerateTimeframe(params.Timeframe))

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
	} else {
		send = func() error {
			log.Debug("Getting anonymous stock group")
			data, err := database.GetAnonymousStockGroup(params.Members, userID)
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

	sse.SendSSEOnStockGroupChange(w, r, send)
}
