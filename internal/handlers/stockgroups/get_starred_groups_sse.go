package stockgroups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/internal/database"
	"stockviewer/internal/handlers/sse"

	log "github.com/sirupsen/logrus"
)

func GetStarredStockGroupsSSE(w http.ResponseWriter, r *http.Request) {
	log.Debug("Getting starred stock groups")

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	rc := http.NewResponseController(w)

	var send func() error

	send = func() error {
		log.Debug("Getting starred stock groups")
		data, err := database.GetStarredStockGroups(userID)
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

	sse.SendSSEOnStockGroupChange(w, r, send)
}
