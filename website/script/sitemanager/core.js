
function checkLoggedIn() {
    if (!document.cookie.includes("isLoggedIn=true")) {
        const prevURL = window.location.href === `${window.location.origin}/login` || window.location.href === `${window.location.origin}/login/` ? "" : window.location.href;
        console.log("not logged in!!!")
        buildPageLogin(prevURL ? getNextPage(prevURL) : buildRootPage)
    } else {
        buildRootPage()
    }
}

function getNextPage(path) {
    return buildRootPage
}

checkLoggedIn()