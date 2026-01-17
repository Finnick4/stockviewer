package handlers

import (
	"net/http"
	"stockviewer/internal/handlers/stocks"

	"github.com/go-chi/chi"
	chimiddle "github.com/go-chi/chi/middleware"
)

func Handler(r *chi.Mux) {
	r.Use(chimiddle.StripSlashes)

	go func() {
		initBuffers()
	}()
	r.Get("/*", HandleIndexHTML)
	r.Get("/style.css", HandleStyleCSS)

	fs := http.FileServer(http.Dir("./static/"))
	r.Handle("/components/*", fs)
	r.Handle("/icons/*", fs)

	r.Route("/api/stocks", func(router chi.Router) {

		router.Post("/", stocks.CreateStock)
		router.Get("/", stocks.GetStocks)
	})
}
