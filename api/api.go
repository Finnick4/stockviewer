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
	ID        int32
	Timeframe int64
}
type StockGetHistoryParams struct {
	ID        int64
	Timeframe int64
}

type UserLoginParams struct {
	Tag      string
	Password string
}

type UserChangePasswordParams struct {
	Tag         string
	OldPassword string
	NewPassword string
}

type UserCreateParams struct {
	Tag      string
	Password string
}

type ArticleCreateParams struct {
	Title   string
	Content string
}

type ArticleGetParams struct {
	Offset int32
	ID     int32
}

type StockGroupCreateParams struct {
	Name    string
	Members []int32
}

type StockGroupGetParams struct {
	ID      int32
	Members []int32
}

type StockGroupEditParams struct {
	ID             int32
	Name           string
	Description    string
	AddedMembers   []int32
	RemovedMembers []int32
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
