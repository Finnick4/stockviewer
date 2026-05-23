package users

import (
	"encoding/json"
	"errors"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"stockviewer/internal/utilities"

	log "github.com/sirupsen/logrus"
)

func EditSelf(w http.ResponseWriter, r *http.Request) {
	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	if userID == "" {
		api.RequestMalformedHandler(w, "Could not parse user ID.")
		return
	}

	var params = dto.EditUserParams{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.RequestMalformedHandler(w, "Could not decode the body")
		log.Error(err)
		return
	}

	aimName := params.Name != ""
	aimTag := params.Tag != ""

	if aimName && !utilities.IsPlausibleUserName(params.Name) {
		api.RequestMalformedHandler(w, "Invalid name!")
		return
	}
	if aimTag && !utilities.IsPlausibleUserTag(params.Tag) {
		api.RequestMalformedHandler(w, "Invalid tag!")
		return
	}

	if aimName && aimTag {
		err = database.SetUserTagAndName(userID, params.Tag, params.Name)
		if err != nil {
			if errors.Is(err, dto.ErrTagAlreadyUsed) {
				api.RequestMalformedHandler(w, "Tag already taken!")
				return
			}
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		go database.LogUserChanges([]dto.UserLogEntry{
			{TargetUserID: userID, IssuerUserID: userID, ActionType: 2, Change: params.Tag},
			{TargetUserID: userID, IssuerUserID: userID, ActionType: 3, Change: params.Name},
		})
	}
	if !aimName && aimTag {
		err = database.SetUserTag(userID, params.Tag)
		if err != nil {
			if errors.Is(err, dto.ErrTagAlreadyUsed) {
				api.RequestMalformedHandler(w, "Tag already taken!")
				return
			}
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		go database.LogUserChange(userID, userID, 2, params.Tag)
	}
	if aimName && !aimTag {
		err = database.SetUserDisplayName(userID, params.Name)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
		go database.LogUserChange(userID, userID, 3, params.Name)
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
