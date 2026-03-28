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
		router.Get("/{stockID}", stocks.GetStock)
		router.Get("/{stockID}/sse", stocks.GetStockSSE)
		router.Get("/{stockID}/influences", stocks.GetInfluences)
		router.Get("/{stockID}/groups", stocks.GetStockGroupMembership)
		router.Get("/{stockID}/groups/sse", stocks.GetStockGroupMembershipSSE)
		router.Put("/{stockID}/star", stocks.StarStock)

		router.With(middleware.ExtractPermissions).Patch("/{stockID}", stocks.EditStock)

		router.Get("/", stocks.GetStocks)
		router.Get("/sse", stocks.GetStocksSSE)

		router.With(middleware.ExtractPermissions).Post("/", stocks.CreateStock)
	})

	r.With(middleware.ValidateToken).Route("/api/stockgroups", func(router chi.Router) {
		router.Get("/{groupID}", stockgroups.GetStockGroup)
		router.Get("/{groupID}/sse", stockgroups.GetStockGroupSSE)
		router.Put("/{groupID}/star", stockgroups.StarStockGroup)

		router.With(middleware.ExtractPermissions).Patch("/{groupID}", stockgroups.EditStockGroup)

		router.Get("/", stockgroups.GetStockGroups)
		router.Get("/sse", stockgroups.GetStockGroupsSSE)

		router.With(middleware.ExtractPermissions).Post("/", stockgroups.CreateStockGroup)
	})

	r.With(middleware.ValidateToken).Route("/api/users", func(router chi.Router) {
		router.Get("/permissions", users.GetPermissions)
		router.Get("/overview", users.GetUserInformation)
		router.With(middleware.ExtractPermissions).Post("/", users.CreateUser)
		router.Delete("/login", users.CloseSession)
	})

	r.With(middleware.ValidateToken).Route("/api/articles", func(router chi.Router) {
		router.Get("/{articleID}", articles.GetArticle)
		router.With(middleware.ExtractPermissions).Patch("/{articleID}", articles.EditArticle)

		router.Get("/", articles.GetArticles)
		router.Get("/unread", articles.GetUnreadArticles)
		router.With(middleware.ExtractPermissions).Post("/", articles.CreateArticle)
	})
}
