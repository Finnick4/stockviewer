package stocks

import (
	"encoding/json"
	"fmt"
	"net/http"
	"stockviewer/api"
	"stockviewer/dto"
	"stockviewer/internal/database"
	"stockviewer/internal/notifiers"
	"stockviewer/internal/utilities"
	"strconv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

func EditStock(w http.ResponseWriter, r *http.Request) {
	stockID, err := strconv.Atoi(chi.URLParam(r, "stockID"))

	if err != nil || stockID == 0 {
		api.RequestMalformedHandler(w, "Could not parse stock ID!")
		return
	}

	log.Debugf("Trying to edit stock %v", stockID)

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

	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		api.InternalErrorHandler(w)
		log.Debug(err)
		return
	}

	if int32(stockID) <= 0 {
		log.Debugf("Could not edit stock %v as the id is invalid", int32(stockID))
		api.RequestMalformedHandler(w, fmt.Sprintf("Could not edit stock %v as the id is invalid", int32(stockID)))
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

	token := r.Context().Value("token").(string)
	userID := database.GetUserIDFromToken(token)

	if aimName && aimPrice && aimShorthand && aimColor {
		err = database.UpdateCompleteStock(params)
		if err != nil {
			api.InternalErrorHandler(w)
			log.Error(err)
			return
		}
		success()
		go notifiers.NotifyStockChange()
		return
	}

	if aimName || aimShorthand {
		if aimName && !aimShorthand {
			err = database.SetStockName(int32(stockID), params.Name)
			if err != nil {
				api.InternalErrorHandler(w)
				log.Error(err)
				return
			}
			go database.LogStockChange(int32(stockID), userID, 2, params.Name)
		}
		if !aimName && aimShorthand {
			err = database.SetStockShorthand(int32(stockID), params.Shorthand)
			if err != nil {
				api.InternalErrorHandler(w)
				log.Error(err)
				return
			}
			go database.LogStockChange(int32(stockID), userID, 3, params.Shorthand)
		}
		if aimName && aimShorthand {
			err = database.SetStockNameAndShorthand(int32(stockID), params.Name, params.Shorthand)
			if err != nil {
				api.InternalErrorHandler(w)
				log.Error(err)
				return
			}
			go database.LogStockChanges([]dto.StockLogEntry{
				{StockID: int32(stockID), UserID: userID, ActionType: 3, Change: params.Shorthand},
				{StockID: int32(stockID), UserID: userID, ActionType: 2, Change: params.Name},
			})
		}

	}
	if aimColor {
		database.SetStockColor(int32(stockID), params.Color)
		go database.LogStockChange(int32(stockID), userID, 4, strconv.Itoa(int(params.Color)))
	}
	if aimPrice {
		err = database.SetStockPrice(int32(stockID), params.Price)
		if err != nil {
			api.InternalErrorHandler(w)
			log.Error(err)
			return
		}
		go database.LogStockChange(int32(stockID), userID, 5, strconv.Itoa(int(params.Price)))
	}

	go notifiers.NotifyStockChange()
	success()
}
