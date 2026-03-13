package stocks

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"stockviewer/internal/utilities"

	log "github.com/sirupsen/logrus"
)

func EditStock(w http.ResponseWriter, r *http.Request) {
	log.Debug("Trying to edit a stock")

	permissions := r.Context().Value("permissions").(map[string]int32)

	editNamePerm := permissions["canEditStockNames"] == 1
	editPricePerm := permissions["canEditStockPrices"] == 1
	editColorPerm := permissions["canEditStockColors"] == 1

	if !editPricePerm && !editNamePerm && !editColorPerm {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	var params = dto.DetailedStock{}

	defer r.Body.Close()

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if params.ID <= 0 {
		log.Debugf("Could not edit stock %v as the id is invalid", params.ID)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not edit stock %v as the id is invalid", params.ID))
		return
	}

	aimPrice := params.Price != 0
	aimName := params.Name != ""
	aimShorthand := params.Shorthand != ""
	aimColor := params.Color != 0

	if aimPrice && !editPricePerm {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}
	if (aimName || aimShorthand) && !editNamePerm {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}
	if aimColor && !editColorPerm {
		api.InsufficientPermissionHandler(w)
		log.Debug("Could not process the request as the requestor doesn't have sufficient permissions.")
		return
	}

	namelen := utilities.CharCount(params.Name)
	if aimName && (params.Name == "" || namelen > 32) {
		log.Debugf("Could not edit stock as there was an issue with the name! Length is %v", namelen)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not stock name as there was an issue with the name! Length is %v", namelen))
		return
	}

	if aimPrice && (params.Price < 1) {
		log.Debugf("Could not edit stock as there was an issue with the price %v! ", params.Price)
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not edit stock as there was an issue with the price %v!", params.Price))
		return
	}

	log.Debugf("Current edit has aims name=%v, shorthand=%v, color=%v and price=%v", aimName, aimShorthand, aimColor, aimPrice)

	success := func() {
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

	if !aimName && !aimPrice && !aimShorthand && !aimColor {
		log.Debug("Could not identify what to edit")
		api.RequestMalformedHandler(w, "Could not identify what to edit")
		return
	}

	if aimName && aimPrice && aimShorthand && aimColor {
		err = database.UpdateCompleteStock(params)
		if err != nil {
			api.InternalErrorHandler(w)
			log.Error(err)
			return
		}
		success()
		return
	}

	if aimName || aimShorthand {
		if aimName && !aimShorthand {
			err = database.SetStockName(params.ID, params.Name)
			if err != nil {
				api.InternalErrorHandler(w)
				log.Error(err)
				return
			}
		}
		if !aimName && aimShorthand {
			err = database.SetStockShorthand(params.ID, params.Shorthand)
			if err != nil {
				api.InternalErrorHandler(w)
				log.Error(err)
				return
			}
		}
		if aimName && aimShorthand {
			err = database.SetStockNameAndShorthand(params.ID, params.Name, params.Shorthand)
			if err != nil {
				api.InternalErrorHandler(w)
				log.Error(err)
				return
			}
		}

	}
	if aimColor {
		database.SetStockColor(params.ID, params.Color)
	}
	if aimPrice {
		err = database.SetStockPrice(params.ID, params.Price)
		if err != nil {
			api.InternalErrorHandler(w)
			log.Error(err)
			return
		}
	}

	success()
}
