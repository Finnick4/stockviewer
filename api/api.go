package api

import (
	"encoding/json"
	"net/http"
)

/* Parameters */

type StockCreateParams struct {
	Name      string
	InitPrice int64
}
type StockGetParams struct {
	ID        int64
	Timeframe int64
}
type StockGetHistoryParams struct {
	ID        int64
	Timeframe int64
}

type SessionLoginParams struct {
	Username string
	Password string
}

/* Response */

type SuccessResponse struct {
	Code int
	Data any
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
