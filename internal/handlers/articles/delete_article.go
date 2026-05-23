package articles

import (
	"encoding/json"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"strconv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func DeleteArticle(w http.ResponseWriter, r *http.Request) {
	articleID, err := strconv.Atoi(chi.URLParam(r, "articleID"))

	if err != nil || articleID <= 0 {
		api.RequestMalformedHandler(w, "Could not parse article ID!")
		return
	}

	permissions := r.Context().Value("permissions").(map[string]int32)

	if permissions["canDeleteArticles"] != 1 {
		api.InsufficientPermissionHandler(w)
		return
	}

	log.Debugf("Trying to delete article %v", articleID)

	err = database.DeleteArticle(int32(articleID))

	if err != nil {
		api.InternalErrorHandler(w)
		log.Error(err)
		return
	}
	go func() {
		token := r.Context().Value("token").(string)
		userID := database.GetUserIDFromToken(token)
		database.LogArticleChange(int32(articleID), userID, 4, "deleted")
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
