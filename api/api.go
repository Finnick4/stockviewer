package api

import (
	"encoding/json"
	"net/http"
	"stockviewer/internal/database"
)

/* Parameters */

type StockCreateParams struct {
	Name      string
	InitPrice float64
}
type StockGetPriceParams struct {
	ID int64
}

/* Responses */

type CreateStockResponse struct {
	Code int
	ID   int64
}
type StockGetPriceResponse struct {
	Code  int
	Price int64
}

type StockGetResponse struct {
	Code int
	Data []database.CurrentStockData
}

/* Others */

type Error struct {
	Code    int
	Message string
}

func writeError(w http.ResponseWriter, message string, code int) {
	resp := Error{
		Code:    code,
		Message: message,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	json.NewEncoder(w).Encode(resp)
}

var (
	RequestErrorHandler = func(w http.ResponseWriter, err error) {
		writeError(w, err.Error(), http.StatusBadRequest)
	}
	RequestMalformedHandler = func(w http.ResponseWriter, msg string) {
		writeError(w, msg, http.StatusBadRequest)
	}
	RequestNothingFoundHandler = func(w http.ResponseWriter, msg string) {
		writeError(w, msg, http.StatusNotFound)
	}
	InternalErrorHandler = func(w http.ResponseWriter) {
		writeError(w, "An Unexpected Error Occured.", http.StatusInternalServerError)
	}
)
