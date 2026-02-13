

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