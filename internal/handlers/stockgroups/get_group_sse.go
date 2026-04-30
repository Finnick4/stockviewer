package stockgroups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"stockviewer/internal/handlers/sse"
	"strconv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func GetStockGroupSSE(w http.ResponseWriter, r *http.Request) {
	groupID, err := strconv.Atoi(chi.URLParam(r, "groupID"))

	if err != nil || groupID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock group ID!")
		return
	}

	log.Debugf("Getting stock group %v", groupID)

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	if int32(groupID) < -1 {
		log.Debugf("Cannot get stock group with id %v", int32(groupID))
		api.RequestMalformedHandler(w, fmt.Sprintf("Cannot get stock group with id %v", int32(groupID)))
		return
	}

	rc := http.NewResponseController(w)

	var send func() error

	if int32(groupID) > 0 || int32(groupID) == -1 {
		send = func() error {
			data, err := database.GetDetailedStockGroup(userID, int32(groupID))
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
		api.RequestMalformedHandler(w, "The provided ID is invalid.")
		return
	}

	sse.SendSSEOnStockGroupChange(w, r, send)
}
