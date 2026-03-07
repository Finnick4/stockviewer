package middleware

import (
	"context"
	"net/http"
	"stockviewer/api"
	"stockviewer/internal/database"
)

func ExtractPermissions(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Context().Value("token").(string)

		permissions, err := database.GetAllTokenPermissionsMap(token)

		if err != nil {
			api.InternalErrorHandler(w)
			return
		}

		ctx := context.WithValue(r.Context(), "permissions", permissions)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
