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
		router.Get("/{stockID}/influences/unread", stocks.GetUnreadInfluences)
		router.Get("/{stockID}/groups", stocks.GetStockGroupMembership)
		router.Get("/{stockID}/groups/sse", stocks.GetStockGroupMembershipSSE)
		router.Put("/{stockID}/star", stocks.StarStock)

		router.With(middleware.ExtractPermissions).Get("/archived", stocks.GetArchivedStocks)
		router.With(middleware.ExtractPermissions).Put("/{stockID}/archive", stocks.ArchiveStock)
		router.With(middleware.ExtractPermissions).Delete("/{stockID}", stocks.DeleteStock)
		router.With(middleware.ExtractPermissions).Patch("/{stockID}", stocks.EditStock)

		router.Get("/", stocks.GetStocks)
		router.Get("/sse", stocks.GetStocksSSE)
		router.Get("/starred", stocks.GetStarredStocks)
		router.Get("/starred/sse", stocks.GetStarredStocksSSE)

		router.With(middleware.ExtractPermissions).Post("/", stocks.CreateStock)
	})

	r.With(middleware.ValidateToken).Route("/api/stockgroups", func(router chi.Router) {
		router.Get("/{groupID}", stockgroups.GetStockGroup)
		router.Get("/{groupID}/sse", stockgroups.GetStockGroupSSE)
		router.Put("/{groupID}/star", stockgroups.StarStockGroup)
		router.Get("/{groupID}/influences", stockgroups.GetInfluences)
		router.Get("/{groupID}/influences/unread", stockgroups.GetUnreadInfluences)

		router.With(middleware.ExtractPermissions).Patch("/{groupID}", stockgroups.EditStockGroup)
		router.With(middleware.ExtractPermissions).Delete("/{groupID}", stockgroups.DeleteStockGroup)

		router.Get("/anonymous", stockgroups.GetStockAnonymousGroup)
		router.Get("/anonymous/sse", stockgroups.GetStockAnonymousGroupSSE)

		router.Get("/", stockgroups.GetStockGroups)
		router.Get("/sse", stockgroups.GetStockGroupsSSE)
		router.Get("/starred", stockgroups.GetStarredStockGroups)
		router.Get("/starred/sse", stockgroups.GetStarredStockGroupsSSE)

		router.With(middleware.ExtractPermissions).Post("/", stockgroups.CreateStockGroup)
	})

	r.With(middleware.ValidateToken).Route("/api/users", func(router chi.Router) {
		router.Get("/self/permissions", users.GetPermissions)
		router.Get("/self/overview", users.GetUserInformation)
		router.Patch("/self", users.EditSelf)
		router.Delete("/login", users.CloseSession)

		router.With(middleware.ExtractPermissions).Post("/", users.CreateUser)

		router.With(middleware.ExtractPermissions).Get("/", users.GetAllUsers)
		router.With(middleware.ExtractPermissions).Get("/{userID}/permissions", users.GetUsersPermission)
		router.With(middleware.ExtractPermissions).Put("/{userID}/permissions", users.UpdateUsersPermission)
		router.With(middleware.ExtractPermissions).Patch("/{userID}", users.EditOtherUser)
		router.With(middleware.ExtractPermissions).Delete("/{userID}", users.DeleteUser)

	})

	r.With(middleware.ValidateToken).Route("/api/articles", func(router chi.Router) {
		router.Get("/{articleID}", articles.GetArticle)
		router.Put("/{articleID}/star", articles.StarArticle)
		router.With(middleware.ExtractPermissions).Patch("/{articleID}", articles.EditArticle)
		router.With(middleware.ExtractPermissions).Delete("/{articleID}", articles.DeleteArticle)

		router.Get("/", articles.GetArticles)
		router.Get("/unread", articles.GetUnreadArticles)
		router.Get("/relevant", articles.GetArticlesAffectingStarred)
		router.Get("/relevant/unread", articles.GetUnreadArticlesAffectingStarred)
		router.With(middleware.ExtractPermissions).Post("/", articles.CreateArticle)
	})
}
