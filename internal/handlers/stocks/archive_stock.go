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

func ArchiveStock(w http.ResponseWriter, r *http.Request) {
	stockID, err := strconv.Atoi(chi.URLParam(r, "stockID"))

	if err != nil || stockID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	permissions := r.Context().Value("permissions").(map[string]int32)

	if permissions["canArchiveStocks"] != 1 {
		api.InsufficientPermissionHandler(w)
		return
	}

	var params = dto.ArchiveParams{}

	defer r.Body.Close()

	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}
	log.Debugf("Trying to archive (%v) stock %v", params.Result, stockID)

	if params.Result {
		err = database.ArchiveStock(int32(stockID))
		go func() {
			token := r.Context().Value("token").(string)
			userID := database.GetUserIDFromToken(token)
			database.LogStockChange(int32(stockID), userID, 6, "")
		}()
	} else {
		err = database.UnarchiveStock(int32(stockID))
		go func() {
			token := r.Context().Value("token").(string)
			userID := database.GetUserIDFromToken(token)
			database.LogStockChange(int32(stockID), userID, 7, "")
		}()
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
