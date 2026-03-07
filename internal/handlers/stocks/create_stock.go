package stocks

import (
	"encoding/json"
	"net/http"
	"stockviewer/internal/utilities"
	"strconv"
	"time"

	"stockviewer/api"
	"stockviewer/internal/database"

	_ "github.com/glebarez/go-sqlite"

	"github.com/gorilla/schema"
	log "github.com/sirupsen/logrus"
)

func CreateStock(w http.ResponseWriter, r *http.Request) {
	t := time.Now()

	log.Debugf("Stock creation is in progress")

	permissions := r.Context().Value("permissions").(map[string]int32)

	if permissions["canCreateStocks"] == 1 {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	var params = api.StockCreateParams{}
	var decoder *schema.Decoder = schema.NewDecoder()
	var err error

	// get parameters
	err = decoder.Decode(&params, r.URL.Query())
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	namelen := utilities.CharCount(params.Name)
	if namelen < 2 || namelen > 32 || params.InitPrice <= 1000000 {
		log.Debugf("Could not accept the request as at least one parameter is invalid (Either the name is missing or too long or the initial price is nonexistent or <= 10000000): name='%v', initprice=%v", params.Name, params.InitPrice)
		api.RequestMalformedHandler(w, "Could not process the request as the parameters are malformed: Either the name is missing or too long or the initial price is nonexistent or <= 10000000")
		return
	}

	shorthandlen := utilities.CharCount(params.Shorthand)
	if shorthandlen < 2 || shorthandlen > 5 {
		log.Debugf("Could not accept the request as shorthand %v is invalid (length %v)", params.Shorthand, shorthandlen)
		api.RequestMalformedHandler(w, "Could not accept the request as shorthand is invalid")
		return
	}

	if _, err := strconv.Atoi(params.Shorthand); err == nil {
		log.Debugf("Could not accept the request as shorthand %v is a number", params.Shorthand)
		api.RequestMalformedHandler(w, "Could not accept the request as shorthand is a number")
		return
	}

	userid := database.GetUserIDFromToken(r.Context().Value("token").(string))

	lastID, err := database.CreateStock(params.Name, params.Shorthand, params.InitPrice, userid)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: lastID,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
	log.Debugf("Time took to create stock was %v", time.Since(t))
}
