

function router(path = getCurrentPathWithoutSlash()) {
    if (path === "" || typeof(path) !== "string") {
        path = "/";
    }
    if (path.charAt(0) !== "/") {
        path = "/" + path;
    }
    const segmentedPath = path.slice(1).split("/")

    switch (segmentedPath[0]) {
        case "":
            buildRootPage();
            break;
        case "login":
            buildPageLogin();
            break;
        case "stocks":
            routerStocks(segmentedPath);
            break;
        case "articles":
            routerArticles(segmentedPath);
            break;
        case "admin":
            routerAdminPanel(segmentedPath);
            break;
        case "settings":
            routerSettingsPanel(segmentedPath);
            break;
        case "groups":
            routerStockGroups(segmentedPath);
            break;
        default:
            build404Page();
    }
}

function routerStocks(segmented) {
    if (segmented[0] !== "stocks") {
        return;
    }

    if (isNaN(segmented[1])) {
        window.history.pushState(null, null, `${window.location.origin}/stocks`);
        buildStocksOverviewPage();
        return;
    }

    buildIndividualStockPage(segmented[1])
}

function routerStockGroups(segmented) {
    if (segmented[0] !== "groups") {
        return;
    }

    if (isNaN(segmented[1])) {
        window.history.pushState(null, null, `${window.location.origin}/groups`);
        buildStockGroupsOverviewPage();
        return;
    }

    buildIndividualStockGroupPage(segmented[1])
}

function routerArticles(segmented) {
    if (segmented[0] !== "articles") {
        return;
    }

    if (isNaN(segmented[1])) {
        window.history.pushState(null, null, `${window.location.origin}/articles`);
        buildArticlesOverviewPage();
        return;
    }

    buildIndividualArticlePage(segmented[1])
}

function routerAdminPanel(segmented) {
    if (segmented[0] !== "admin") {
        return;
    }

    if (typeof(segmented[1]) === "undefined" || segmented[1] === "") {
        window.history.pushState(null, null, `${window.location.origin}/admin`);
        buildAdminRootPage();
        return;
    }

    switch (segmented[1]) {
        case "users":
            buildAdminUsersPage();
            break;
        case "stocks":
            buildAdminStocksPage();
            break;
        default:
            build404Page();
    }
}

function routerSettingsPanel(segmented) {
    if (segmented[0] !== "settings") {
        return;
    }

    if (typeof(segmented[1]) === "undefined" || segmented[1] === "") {
        window.history.pushState(null, null, `${window.location.origin}/settings`);
        buildSettingsRootPage();
        return;
    }

    switch (segmented[1]) {
        default:
            build404Page();
    }
}

