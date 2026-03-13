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

func EditArticle(w http.ResponseWriter, r *http.Request) {
	log.Debug("Trying to edit an article")

	permissions := r.Context().Value("permissions").(map[string]int32)
	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	permArticles := permissions["canEditArticles"] == 1
	permInfluences := permissions["canModifyInfluences"] == 1
	permMaxPermille := permissions["maxInfluencePermille"]

	if !permArticles && !permInfluences {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	var params = dto.ArticleEditParams{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	aimTitle := params.Title != ""
	aimContent := params.Content != ""
	aimAddInfluences := len(params.AddedInfluences) > 0
	aimEditInfluences := len(params.EditedInfluences) > 0
	aimRemoveInfluences := len(params.RemovedInfluences) > 0

	if (aimTitle || aimContent) && !permArticles {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}
	if (aimAddInfluences || aimEditInfluences || aimRemoveInfluences) && !permInfluences {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	if params.ID < 1 {
		log.Debugf("Could not edit article as the id %v is invalid!", params.ID)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not edit article as the id %v is invalid!", params.ID))
		return
	}

	titlelen := utilities.CharCount(params.Title)
	if aimTitle && (titlelen > 96 || titlelen < 10) {
		log.Debugf("Could not edit article as there was an issue with the title! Length is %v", titlelen)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not edit article as there was an issue with the title! Length is %v", titlelen))
		return
	}

	stockIDs := make([]int32, len(params.AddedInfluences)+len(params.EditedInfluences))
	i := 0
	for _, influence := range params.AddedInfluences {
		if permMaxPermille != -1 && math.Abs(float64(influence.PermillePerDay)) > float64(permMaxPermille) {
			api.InsufficientPermissionHandler(w)
			log.Debug("Could not process the request as the requestor doesn't have sufficient permissions to choose influence permilles this high.")
			return
		}
		params.AddedInfluences[i].CreatorID = userID
		params.AddedInfluences[i].ArticleID = params.ID
		if !utilities.IsValidFalloffType(influence.FalloffType) {
			params.AddedInfluences[i].FalloffType = 0
		}
		stockIDs[i] = influence.StockID
		i++
	}
	for _, influence := range params.EditedInfluences {
		if permMaxPermille != -1 && math.Abs(float64(influence.PermillePerDay)) > float64(permMaxPermille) {
			api.InsufficientPermissionHandler(w)
			log.Debug("Could not process the request as the requestor doesn't have sufficient permissions to choose influence permilles this high.")
			return
		}
		params.EditedInfluences[i].ArticleID = params.ID
		if !utilities.IsValidFalloffType(influence.FalloffType) {
			params.AddedInfluences[i].FalloffType = 0
		}
		stockIDs[i] = influence.StockID
		i++
	}

	if (aimEditInfluences || aimAddInfluences) && !database.AreActiveStockIDs(stockIDs) {
		log.Debug("Could not edit article as invalid stocks were included in the influences!")
		api.RequestMalformedHandler(w, "Could not edit article as invalid stocks were included in the influences!")
		return
	}

	if aimTitle {
		err = database.EditArticleTitleAndContent(params.ID, params.Title, params.Content)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
	}
	if !aimTitle && aimContent {
		err = database.EditArticleContent(params.ID, params.Content)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
	}
	if aimRemoveInfluences {
		if len(params.RemovedInfluences) == 1 {
			err = database.RemoveInfluence(params.ID, params.RemovedInfluences[0])
		} else {
			err = database.RemoveInfluences(params.ID, params.RemovedInfluences)
		}

		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
	}

	if aimAddInfluences {
		err := database.CreateInfluences(params.AddedInfluences)

		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
	}
	if aimEditInfluences {
		api.NotImplementedHandler(w)
		log.Warn("Removing / editing influences of an articles is not yet implemented!")
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
