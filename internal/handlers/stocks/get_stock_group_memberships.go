package stocks

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func GetStockGroupMembership(w http.ResponseWriter, r *http.Request) {
	log.Debugf("Getting all groups a stock is a member of")

	var params = dto.StockGroupMembershipParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error("Error while decoding params")
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if params.ID <= 0 {
		log.Debugf("Invalid stock ID %v", params.ID)
		api.RequestMalformedHandler(w, fmt.Sprintf("Invalid stock ID %v", params.ID))
		return
	}

	data, err := database.GetAllGroupsWithMemberStockID(params.ID)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: data,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}
	return
}
