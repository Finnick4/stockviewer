package middleware

import (
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
)

func ValidateToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Context().Value("token").(string)

		if database.GetTokenStatus(token) != 1 {
			api.RequestUnauthorisedHandler(w)
			return
		}
		next.ServeHTTP(w, r)
	})
}
