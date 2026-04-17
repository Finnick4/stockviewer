package stocks

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"

	_ "github.com/glebarez/go-sqlite"
	log "github.com/sirupsen/logrus"
)

func GetArchivedStocks(w http.ResponseWriter, r *http.Request) {
	permissions := r.Context().Value("permissions").(map[string]int32)

	if permissions["isStockArchivist"] != 1 {
		api.InsufficientPermissionHandler(w)
		return
	}

	log.Debugf("Inquiring archived stocks")

	data, err := database.GetArchivedStocks()
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
