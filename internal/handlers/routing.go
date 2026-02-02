package handlers

import (
	"net/http"
	"stockviewer/internal/handlers/middleware"
	"stockviewer/internal/handlers/sessions"
	"stockviewer/internal/handlers/stocks"

	"github.com/go-chi/chi"
	chimiddle "github.com/go-chi/chi/middleware"
)

func Handler(r *chi.Mux) {
	r.Use(chimiddle.StripSlashes)
	r.Use(middleware.ExtractToken)

	go func() {
		initBuffers()
	}()
	r.Get("/*", HandleIndexHTML)
	r.Get("/style.css", HandleStyleCSS)
	r.Get("/script.js", HandleScriptJS)
	r.Post("/api/users/login", sessions.LoginSession)

	fs := http.FileServer(http.Dir("./website/"))
	r.Handle("/icons/*", fs)

	r.With(middleware.ValidateToken).Route("/api/stocks", func(router chi.Router) {

		router.Post("/", stocks.CreateStock)
		router.Get("/", stocks.GetStocks)
	})
}
