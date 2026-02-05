package stocks

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"stockviewer/internal/handlers/sse"

	_ "github.com/glebarez/go-sqlite"
	"github.com/gorilla/schema"

	log "github.com/sirupsen/logrus"
)

func GetStocks(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Inquiring stocks")
	var params = api.StockGetParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	rc := http.NewResponseController(w)

	var send func() error

	if params.ID > 0 {
		if database.IsValidTimeframeScope(params.Timeframe) {
			send = func() error {
				history, err := database.GetStockPriceHistory(params.ID, database.GenerateTimeframe(params.Timeframe))
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
				price, err := database.GetStockPrice(params.ID)
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
	} else {
		if database.IsValidTimeframeScope(params.Timeframe) {
			send = func() error {
				deltas, err := database.GetStocksPriceDelta()
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
				data, err := database.GetCurrentStockInformation()
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
	}

	sse.SendSSEOnStockStep(w, r, send)
}
