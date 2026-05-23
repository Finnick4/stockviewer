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
	"strconv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func EditArticle(w http.ResponseWriter, r *http.Request) {
	articleID, err := strconv.Atoi(chi.URLParam(r, "articleID"))

	if err != nil || articleID == 0 {
		api.RequestMalformedHandler(w, "Could not parse article ID!")
		return
	}

	log.Debugf("Trying to edit article %v", articleID)

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

	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	log.Info(params)

	aimTitle := params.Title != ""
	aimContent := params.Content != ""
	aimDeleteContent := !aimContent && params.RemoveContent
	aimAddInfluences := len(params.AddedInfluences) > 0
	aimEditInfluences := len(params.EditedInfluences) > 0
	aimRemoveInfluences := len(params.RemovedInfluences) > 0

	if (aimTitle || aimContent || aimDeleteContent) && !permArticles {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}
	if (aimAddInfluences || aimEditInfluences || aimRemoveInfluences) && !permInfluences {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	if int32(articleID) < 1 {
		log.Debugf("Could not edit article as the id %v is invalid!", int32(articleID))
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not edit article as the id %v is invalid!", int32(articleID)))
		return
	}

	titlelen := utilities.CharCount(params.Title)
	if aimTitle && (titlelen > 96 || titlelen < 10) {
		log.Debugf("Could not edit article as there was an issue with the title! Length is %v", titlelen)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not edit article as there was an issue with the title! Length is %v", titlelen))
		return
	}

	stockIDs := make([]int32, len(params.AddedInfluences)+len(params.EditedInfluences)+len(params.RemovedInfluences))
	i := 0
	for index, influence := range params.AddedInfluences {
		if permMaxPermille != -1 && math.Abs(float64(influence.PermillePerDay)) > float64(permMaxPermille) {
			api.InsufficientPermissionHandler(w)
			log.Debug("Could not process the request as the requestor doesn't have sufficient permissions to choose influence permilles this high.")
			return
		}
		params.AddedInfluences[index].CreatorID = userID
		params.AddedInfluences[index].ArticleID = int32(articleID)
		if !utilities.IsValidFalloffType(influence.FalloffType) {
			params.AddedInfluences[index].FalloffType = 0
		}
		if influence.LengthMinutes == 0 || influence.PermillePerDay == 0 {
			log.Debug("Could not edit article as influences with either length or permille of 0 were included!")
			api.RequestMalformedHandler(w, "Could not edit article as influences with either length or permille of 0 were included!")
			return
		}
		stockIDs[i] = influence.StockID
		i++
	}
	for index, influence := range params.EditedInfluences {
		if permMaxPermille != -1 && math.Abs(float64(influence.PermillePerDay)) > float64(permMaxPermille) {
			api.InsufficientPermissionHandler(w)
			log.Debug("Could not process the request as the requestor doesn't have sufficient permissions to choose influence permilles this high.")
			return
		}
		params.EditedInfluences[index].ArticleID = int32(articleID)
		if !utilities.IsValidFalloffType(influence.FalloffType) {
			params.AddedInfluences[index].FalloffType = 0
		}
		if influence.LengthMinutes == 0 || influence.PermillePerDay == 0 {
			log.Debug("Could not edit article as influences with either length or permille of 0 were included!")
			api.RequestMalformedHandler(w, "Could not edit article as influences with either length or permille of 0 were included!")
			return
		}
		stockIDs[i] = influence.StockID
		i++
	}
	for _, stock := range params.RemovedInfluences {
		stockIDs[i] = stock
		i++
	}

	if (aimEditInfluences || aimAddInfluences) && !database.AreActiveStockIDs(stockIDs) {
		log.Debug("Could not edit article as invalid stocks were included in the influences!")
		api.RequestMalformedHandler(w, "Could not edit article as invalid stocks were included in the influences!")
		return
	}

	if aimTitle {
		// The database ignores content if it is set to "".
		// Thus, if both are to be changed, they are.
		// If only the title has to be modified, the database handles this.
		err = database.EditArticleTitleAndContent(int32(articleID), params.Title, params.Content)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		if aimContent {
			go database.LogArticleChange(int32(articleID), userID, 3, params.Content)
		}
		go database.LogArticleChange(int32(articleID), userID, 2, params.Title)
	}
	if !aimTitle && aimContent {
		// Changing the title or title and content is handled above!
		err = database.EditArticleContent(int32(articleID), params.Content)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		go database.LogArticleChange(int32(articleID), userID, 3, params.Content)
	}

	if aimDeleteContent {
		err = database.RemoveArticleContent(int32(articleID))
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		go database.LogArticleChange(int32(articleID), userID, 3, "")
	}

	if aimEditInfluences {
		if len(params.EditedInfluences) == 1 {
			err = database.EditInfluence(params.EditedInfluences[0])
		} else {
			err = database.EditInfluences(params.EditedInfluences)
		}

		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		go func() {
			entries := make([]dto.ArticleLogEntry, len(params.EditedInfluences))

			for i, influenceParams := range params.EditedInfluences {
				influence := dto.LoggedInfluence{
					StockID:        influenceParams.StockID,
					LengthMinutes:  influenceParams.LengthMinutes,
					PermillePerDay: influenceParams.PermillePerDay,
					FalloffType:    influenceParams.FalloffType,
				}
				marshalled, err := json.Marshal(influence)
				if err != nil {
					log.Errorf("Encountered an issue while marshalling influence for logging editing of said influence for an existing article (%v)!", articleID)
					log.Error(err)
					return
				}
				entries[i] = dto.ArticleLogEntry{
					ArticleID:  int32(articleID),
					UserID:     userID,
					ActionType: 6,
					Change:     string(marshalled),
				}
			}
			database.LogArticleChanges(entries)
		}()
	}

	if aimRemoveInfluences {
		if len(params.RemovedInfluences) == 1 {
			err = database.RemoveInfluence(int32(articleID), params.RemovedInfluences[0])
		} else {
			err = database.RemoveInfluences(int32(articleID), params.RemovedInfluences)
		}

		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		go func() {
			entries := make([]dto.ArticleLogEntry, len(params.RemovedInfluences))

			for i, stock := range params.RemovedInfluences {
				entries[i] = dto.ArticleLogEntry{
					ArticleID:  int32(articleID),
					UserID:     userID,
					ActionType: 7,
					Change:     strconv.Itoa(int(stock)),
				}
			}
			database.LogArticleChanges(entries)
		}()
	}

	if aimAddInfluences {
		err := database.CreateInfluences(params.AddedInfluences)

		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		go func() {
			entries := make([]dto.ArticleLogEntry, len(params.AddedInfluences))

			for i, influenceParams := range params.AddedInfluences {
				influence := dto.LoggedInfluence{
					StockID:        influenceParams.StockID,
					LengthMinutes:  influenceParams.LengthMinutes,
					PermillePerDay: influenceParams.PermillePerDay,
					FalloffType:    influenceParams.FalloffType,
				}
				marshalled, err := json.Marshal(influence)
				if err != nil {
					log.Errorf("Encountered an issue while marshalling influence for logging the creation of said influence for an existing article (%v)!", articleID)
					log.Error(err)
					return
				}
				entries[i] = dto.ArticleLogEntry{
					ArticleID:  int32(articleID),
					UserID:     userID,
					ActionType: 5,
					Change:     string(marshalled),
				}
			}
			database.LogArticleChanges(entries)
		}()
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
