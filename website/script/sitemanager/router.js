

function router(path = getCurrentPathWithoutSlash()) {
    if (path === "") {
        path = "/"
    }
    switch (path) {
        case "/":
            buildRootPage();
            break;
        case "/login":
            buildPageLogin();
            break;
        case "/stocks":
            buildStocksOverviewPage();
            break;

    }
}

