package handlers

import (
	"github.com/go-chi/chi"
	chimiddle "github.com/go-chi/chi/middleware"
)

func Handler(r *chi.Mux) {
	r.Use(chimiddle.StripSlashes)

	r.Route("/api/stocks", func(router chi.Router) {

		router.Post("/", CreateStock)
		router.Get("/price", GetStockPrice)
		router.Get("/", GetStocks)
	})
}
