package middleware

import (
	"context"
	"errors"
	"net/http"
	"stockviewer/api"
	"strings"
)

func ExtractToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")

		if header != "" || strings.HasPrefix(header, "Bearer ") {
			token := strings.TrimPrefix(header, "Bearer ")
			ctx := context.WithValue(r.Context(), "token", token)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		cookie, err := r.Cookie("token")

		if err != nil {
			if errors.Is(err, http.ErrNoCookie) {
				ctx := context.WithValue(r.Context(), "token", "")
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

			api.InternalErrorHandler(w)
			return
		}

		ctx := context.WithValue(r.Context(), "token", cookie.Value)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
