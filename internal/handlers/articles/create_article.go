package articles

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"stockviewer/internal/utilities"

	log "github.com/sirupsen/logrus"
)

func CreateArticle(w http.ResponseWriter, r *http.Request) {
	log.Debugf("DetailedArticle creation is in progress")

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)
	permissions := r.Context().Value("permissions").(map[string]int32)

	permArticle := permissions["canCreateArticles"] == 1
	permInfluences := permissions["canModifyInfluences"] == 1
	permMaxPermille := permissions["maxInfluencePermille"]
	if !permArticle {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions to create articles.")
		return
	}

	var params = dto.ArticleCreateParams{}

	// get parameters
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if len(params.Influences) != 0 && !permInfluences {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions to create influences.")
		return
	}

	titlelen := utilities.CharCount(params.Title)
	if titlelen > 96 || titlelen < 10 {
		log.Debugf("Could not create article as there was an issue with the title! Length is %v", titlelen)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not create article as there was an issue with the title! Length is %v", titlelen))
		return
	}

	stockIDs := make([]int32, len(params.Influences))
	for i, influence := range params.Influences {
		if permMaxPermille != -1 && math.Abs(float64(influence.PermillePerDay)) > float64(permMaxPermille) {
			api.InsufficientPermissionHandler(w)
			log.Debug("Could not process the request as the requestor doesn't have sufficient permissions to choose influence permilles this high.")
			return
		}
		params.Influences[i].CreatorID = userID
		if !utilities.IsValidFalloffType(influence.FalloffType) {
			params.Influences[i].FalloffType = 0
		}
		stockIDs[i] = influence.StockID
	}

	if len(params.Influences) != 0 && !database.AreActiveStockIDs(stockIDs) {
		log.Debug("Could not create article as invalid stocks were included in the influences!")
		api.RequestMalformedHandler(w, "Could not create article as invalid stocks were included in the influences!")
		return
	}

	id, err := database.CreateArticle(params.Title, params.Content, userID)

	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}

	if len(params.Influences) != 0 {
		for i := range params.Influences {
			params.Influences[i].ArticleID = id
		}
		err := database.CreateInfluences(params.Influences)

		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
	}

	var response = api.SuccessResponse{
		Code: http.StatusOK,
		Data: id,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Error(err)
		api.InternalErrorHandler(w)
		return
	}
}
