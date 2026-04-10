package users

import (
	"encoding/json"
	"errors"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"stockviewer/internal/utilities"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func EditOtherUser(w http.ResponseWriter, r *http.Request) {
	permissions := r.Context().Value("permissions").(map[string]int32)

	permName := permissions["canEditUserName"] == 1
	permPW := permissions["canEditUserPassword"] == 1

	if !permPW && !permName {
		api.InsufficientPermissionHandler(w)
		return
	}

	userID := chi.URLParam(r, "userID")

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
	aimPW := params.Password != ""

	if ((aimName || aimTag) && !permName) || aimPW && !permPW {
		api.InsufficientPermissionHandler(w)
		return
	}

	if aimName && !utilities.IsPlausibleUserName(params.Name) {
		api.RequestMalformedHandler(w, "Invalid name!")
		return
	}
	if aimTag && !utilities.IsPlausibleUserTag(params.Tag) {
		api.RequestMalformedHandler(w, "Invalid tag!")
		return
	}
	if aimPW && !utilities.IsPlausiblePassword(params.Password) {
		api.RequestMalformedHandler(w, "Invalid password!")
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
	}
	if aimName && !aimTag {
		err = database.SetUserDisplayName(userID, params.Name)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
	}
	if aimPW {
		err = database.ResetUserPassword(userID, params.Password)
		if err != nil {
			log.Error(err)
			api.InternalErrorHandler(w)
			return
		}
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
