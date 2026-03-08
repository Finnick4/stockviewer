package stocks

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

func GetStockGroupMembershipSSE(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting all groups a stock is a member of")

	var params = dto.StockGroupMembershipParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error("Error while decoding params")
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if params.ID <= 0 {
		log.Debugf("Invalid stock ID %v", params.ID)
		api.RequestMalformedHandler(w, fmt.Sprintf("Invalid stock ID %v", params.ID))
		return
	}

	rc := http.NewResponseController(w)

	send := func() error {
		log.Debugf("Getting all groups stock %v is a member of", params.ID)
		data, err := database.GetAllGroupsWithMemberStockID(params.ID)
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
