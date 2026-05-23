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

func DeleteStock(w http.ResponseWriter, r *http.Request) {
	stockID, err := strconv.Atoi(chi.URLParam(r, "stockID"))

	if err != nil || stockID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	permissions := r.Context().Value("permissions").(map[string]int32)

	if permissions["canDeleteStocks"] != 1 {
		api.InsufficientPermissionHandler(w)
		return
	}

	var params = dto.StockDeleteParams{}

	defer r.Body.Close()

	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	token := r.Context().Value("token").(string)
	userTag := database.GetUserTagFromToken(token)

	if !database.IsCorrectPassword(userTag, params.Password) {
		api.RequestUnauthorisedHandler(w)
		return
	}

	log.Debugf("Trying to delete stock %v", stockID)

	err = database.DeleteStock(int32(stockID))

	if err != nil {
		api.InternalErrorHandler(w)
		log.Error(err)
		return
	}

	go func() {
		userID := database.GetUserIDFromToken(token)
		database.LogStockChange(int32(stockID), userID, 8, "deleted")
	}()

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
