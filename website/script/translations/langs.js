
function initialiseLanguages() {
    lang = {}
    supportedLanguages = {
        "en": {
            header: {
                stocks: "Stocks",
                articles: "Articles",
                stock_groups: "Groups",
                search: {
                    placeholder: "Search..."
                }
            },
            creator: {
                stock: "Create Stock",
                stock_group: "Create Stock Group",
                article: "Create Article",
                user: "Create User"
            },
            user_manager: {
                dashboard_account: "Account Settings",
                dashboard_admin: "Administration",
                logout: "Log out"
            }
        },
        "de": {
            header: {
                stocks: "Aktien",
                articles: "Artikel",
                stock_groups: "Gruppen",
                search: {
                    placeholder: "Suche..."
                }
            },
            creator: {
                stock: "Aktie erstellen",
                stock_group: "Aktiengruppe erstellen",
                article: "Artikel erstellen",
                user: "Benutzer erstellen"
            },
            user_manager: {
                dashboard_account: "Benutzereinstellungen",
                dashboard_admin: "Administration",
                logout: "Abmelden"
            }
        }
    }
}