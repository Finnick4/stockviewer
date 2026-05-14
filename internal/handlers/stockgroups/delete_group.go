package stockgroups

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"strconv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func DeleteStockGroup(w http.ResponseWriter, r *http.Request) {
	groupID, err := strconv.Atoi(chi.URLParam(r, "groupID"))

	if err != nil || groupID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock group ID!")
		return
	}

	permissions := r.Context().Value("permissions").(map[string]int32)

	if permissions["canDeleteStockGroups"] != 1 {
		api.InsufficientPermissionHandler(w)
		return
	}

	log.Debugf("Trying to delete stock group %v", groupID)

	err = database.DeleteStockGroup(int32(groupID))

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
