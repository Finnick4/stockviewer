package handlers

import (
	"net/http"
	"stockviewer/internal/handlers/articles"
	"stockviewer/internal/handlers/middleware"
	"stockviewer/internal/handlers/stockgroups"
	"stockviewer/internal/handlers/stocks"
	"stockviewer/internal/handlers/users"

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
	r.Post("/api/users/login", users.LoginSession)
	r.Patch("/api/users/login", users.ChangePassword)

	fs := http.FileServer(http.Dir("./website/"))
	r.Handle("/icons/*", fs)

	r.With(middleware.ValidateToken).Route("/api/stocks", func(router chi.Router) {
		router.Post("/", stocks.CreateStock)
		router.Get("/", stocks.GetStocks)
		router.Get("/sse", stocks.GetStocksSSE)
		router.Patch("/", stocks.EditStock)
	})

	r.With(middleware.ValidateToken).Route("/api/stockgroups", func(router chi.Router) {
		router.Post("/", stockgroups.CreateStockGroup)
		router.Get("/", stockgroups.GetStockGroup)
	})

	r.With(middleware.ValidateToken).Route("/api/users", func(router chi.Router) {
		router.Get("/permissions", users.GetPermissions)
		router.Get("/overview", users.GetUserInformation)
		router.Post("/", users.CreateUser)
		router.Delete("/login", users.CloseSession)
	})

	r.With(middleware.ValidateToken).Route("/api/articles", func(router chi.Router) {
		router.Post("/", articles.CreateArticle)
		router.Get("/", articles.GetArticles)
		router.Patch("/", articles.EditArticle)
	})
}
