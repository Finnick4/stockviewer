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

		if permissions["canEditUserPermissions"] == 1 || permissions["canEditUserName"] == 1 || permissions["canEditUserPassword"] == 1 || permissions["canDisableUsers"] == 1 || permissions["canDeleteUsers"] == 1 {
			permissions["canViewUsers"] = 1
		}

		ctx := context.WithValue(r.Context(), "permissions", permissions)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
