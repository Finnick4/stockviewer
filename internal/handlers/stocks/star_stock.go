package stocks

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"strconv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func StarStock(w http.ResponseWriter, r *http.Request) {
	stockID, err := strconv.Atoi(chi.URLParam(r, "stockID"))

	if err != nil || stockID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	log.Debugf("Trying to star stock %v", stockID)

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	var params = dto.StarParams{}

	defer r.Body.Close()

	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if !database.AreActiveStockIDs([]int32{int32(stockID)}) {
		api.RequestMalformedHandler(w, "Cannot star invalid stock id!")
		log.Debugf("Stock id %v is invalid", int32(stockID))
		return
	}

	log.Debugf("User tries to star (%v) stock id %v", params.Result, int32(stockID))

	if params.Result {
		err = database.StarStockID(int32(stockID), userID)
	} else {
		err = database.UnstarStockID(int32(stockID), userID)
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
