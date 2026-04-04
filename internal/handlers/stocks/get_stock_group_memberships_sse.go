package stocks

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

func GetStockGroupMembershipSSE(w http.ResponseWriter, r *http.Request) {
	stockID, err := strconv.Atoi(chi.URLParam(r, "stockID"))

	if err != nil || stockID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	log.Debugf("Getting all groups stock %v is a member of", stockID)

	if int32(stockID) <= 0 {
		log.Debugf("Invalid stock ID %v", int32(stockID))
		api.RequestMalformedHandler(w, fmt.Sprintf("Invalid stock ID %v", int32(stockID)))
		return
	}

	rc := http.NewResponseController(w)

	send := func() error {
		log.Debugf("Getting all groups stock %v is a member of", int32(stockID))
		data, err := database.GetAllGroupsWithMemberStockID(int32(stockID))
		if err != nil {
			log.Error("Error while querying DB (database.GetAllGroupsWithMemberStockID)")
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

	sse.SendSSEOnStockGroupChange(w, r, send)
}
