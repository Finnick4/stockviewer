package stocks

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"

	log "github.com/sirupsen/logrus"
)

func StarStock(w http.ResponseWriter, r *http.Request) {
	log.Debug("Trying to star a stock")

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	var params = api.StockStarParams{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if !database.AreActiveStockIDs([]int32{params.ID}) {
		api.RequestMalformedHandler(w, "Cannot star invalid stock id!")
		log.Debugf("Stock id %v is invalid", params.ID)
		return
	}

	log.Debugf("User tries to star (%v) stock id %v", params.Result, params.ID)

	if params.Result {
		err = database.StarStockID(params.ID, userID)
	} else {
		err = database.UnstarStockID(params.ID, userID)
	}

	if err != nil {
		api.InternalErrorHandler(w)
		log.Error(err)
		return
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: "success",
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
