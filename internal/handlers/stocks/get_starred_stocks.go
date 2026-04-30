package stocks

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func GetStarredStocks(w http.ResponseWriter, r *http.Request) {
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

	var send func()

	if dto.IsValidTimeframeLength(params.Timeframe) {
		send = func() {
			deltas, err := database.GetStarredStocksDelta(userID, dto.GenerateTimeframe(params.Timeframe))
			if err != nil {
				api.InternalErrorHandler(w)
				log.Error(err)
				return
			}

			var response = api.SuccessResponse{
				Code: http.StatusOK,
				Data: deltas,
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
			data, err := database.GetStarredStocks(userID)
			if err != nil {
				api.InternalErrorHandler(w)
				log.Error(err)
				return
			}

			var response = api.SuccessResponse{
				Code: http.StatusOK,
				Data: data,
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
