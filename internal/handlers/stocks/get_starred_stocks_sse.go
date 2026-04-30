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

func GetStarredStocksSSE(w http.ResponseWriter, r *http.Request) {
	log.Debug("Getting starred stocks")

	var params = dto.StockGetParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	rc := http.NewResponseController(w)

	var send func() error

	if dto.IsValidTimeframeLength(params.Timeframe) {
		send = func() error {
			deltas, err := database.GetStarredStocksDelta(userID, dto.GenerateTimeframe(params.Timeframe))
			if err != nil {
				return err
			}

			resp, err := json.Marshal(deltas)
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
			data, err := database.GetStarredStocks(userID)
			if err != nil {
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

	sse.SendSSEOnStockChange(w, r, send)
}
