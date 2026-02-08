package middleware

import (
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
)

func ValidateToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Context().Value("token").(string)

		status := database.GetTokenStatus(token)

		switch status {
		case 1:
			next.ServeHTTP(w, r)
		case 2:
			api.PasswordChangeRequiredHandler(w)
			return
		default:
			api.RequestUnauthorisedHandler(w)
			return
		}
	})
}
