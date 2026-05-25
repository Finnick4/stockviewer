package stocks

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"stockviewer/internal/handlers/sse"
	"strconv"

	"github.com/go-chi/chi"
	"github.com/gorilla/schema"

	log "github.com/sirupsen/logrus"
)

func GetStockSSE(w http.ResponseWriter, r *http.Request) {
	stockID, err := strconv.Atoi(chi.URLParam(r, "stockID"))

	if err != nil || stockID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	log.Debugf("Inquiring stock %v", stockID)

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	var params = dto.GetHistoryParams{}
	var decoder *schema.Decoder = schema.NewDecoder()

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	rc := http.NewResponseController(w)

	var send func() error

	if dto.IsValidTimeframeLength(params.Timeframe) {
		send = func() error {
			history, err := database.GetStockPriceHistory(int32(stockID), dto.GenerateTimeframe(params.Timeframe))
			if err != nil {
				return err
			}

			if len(history) == 0 {
				api.RequestNothingFoundHandler(w, "Did not find a stock with the given ID.")
				return errors.New("no such stock found")
			}

			resp, err := json.Marshal(history)
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
			price, err := database.GetStockInfo(int32(stockID), userID)
			if err != nil {
				return err
			}

			resp, err := json.Marshal(price)
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
