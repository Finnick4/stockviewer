package handlers

import (
	"context"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
	"strings"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			api.RequestUnauthorisedHandler(w)
			return
		}
		token := strings.TrimPrefix(header, "Bearer ")

		if database.GetTokenStatus(token) != 1 {
			api.RequestUnauthorisedHandler(w)
			return
		}
		ctx := context.WithValue(r.Context(), "token", token)
		next.ServeHTTP(w, r.WithContext(ctx))
	})

}
