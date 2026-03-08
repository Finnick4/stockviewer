package api

import (
	"encoding/json"
	"net/http"
)

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
	NotImplementedHandler = func(w http.ResponseWriter) {
		writeError(w, "This is not yet implemented!", http.StatusNotImplemented)
	}
	InternalErrorHandler = func(w http.ResponseWriter) {
		writeError(w, "An Unexpected Error occurred.", http.StatusInternalServerError)
	}
	RequestUnauthorisedHandler = func(w http.ResponseWriter) {
		writeError(w, "The request is unauthorised. Please use a token or generate one with the correct name and password!", http.StatusUnauthorized)
	}
	InsufficientPermissionHandler = func(w http.ResponseWriter) {
		writeError(w, "No sufficient permission for this action is currently present with the associated token!", http.StatusForbidden)
	}
	PasswordChangeRequiredHandler = func(w http.ResponseWriter) {
		writeError(w, "Please change your password immediately. Till this happens, this account is frozen. For this, send a PATCH request to /api/users/login with the username, old password and new password.", http.StatusForbidden)
	}
)
