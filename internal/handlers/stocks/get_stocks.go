package stocks

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"

	_ "github.com/glebarez/go-sqlite"
	"github.com/gorilla/schema"

	log "github.com/sirupsen/logrus"
)

func GetStocks(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Inquiring stocks")

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

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

	var send func()

	if dto.IsValidTimeframeScope(params.Timeframe) {
		send = func() {
			deltas, err := database.GetStocksPriceDelta(dto.GenerateTimeframe(params.Timeframe))
			if err != nil {
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
			data, err := database.GetCurrentStockInformation(userID)
			if err != nil {
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
