package stocks

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"strconv"

	_ "github.com/glebarez/go-sqlite"
	"github.com/go-chi/chi"
	"github.com/gorilla/schema"

	log "github.com/sirupsen/logrus"
)

func GetStock(w http.ResponseWriter, r *http.Request) {
	stockID, err := strconv.Atoi(chi.URLParam(r, "stockID"))

	if err != nil || stockID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	log.Debugf("Inquiring stock %v", stockID)

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	var params = dto.StockGetParams{}
	var decoder *schema.Decoder = schema.NewDecoder()

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	var send func()

	if dto.IsValidTimeframeLength(params.Timeframe) {
		send = func() {
			history, err := database.GetStockPriceHistory(int32(stockID), dto.GenerateTimeframe(params.Timeframe))
			if err != nil {
				log.Error(err)
				return
			}

			if len(history) == 0 {
				log.Error(err)
				api.RequestNothingFoundHandler(w, "Did not find a stock with the given ID.")
				return
			}

			var response = api.SuccessResponse{
				Code: http.StatusOK,
				Data: history,
			}

			w.Header().Set("Content-Type", "application/json")
			err = json.NewEncoder(w).Encode(response)
			if err != nil {
				log.Error(err)
				api.InternalErrorHandler(w)
				return
			}
		}

	} else {
		send = func() {
			price, err := database.GetStockInfo(int32(stockID), userID)
			if err != nil {
				log.Error(err)
				return
			}

			var response = api.SuccessResponse{
				Code: http.StatusOK,
				Data: price,
			}

			w.Header().Set("Content-Type", "application/json")
			err = json.NewEncoder(w).Encode(response)
			if err != nil {
				log.Error(err)
				api.InternalErrorHandler(w)
				return
			}
		}
	}
	send()
}
