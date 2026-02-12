
function checkLoggedIn() {
    if (!document.cookie.includes("isLoggedIn=true")) {
        console.log("not logged in!!!")
        window.history.pushState(null, null, `${window.location.origin}/login`)
        buildPageLogin()
    }
}

function logout() {
    console.log("Logging out!")
    document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    userInformation.signalLogout()
    checkLoggedIn()
}


function getCurrentPathWithoutSlash() {
    const p = window.location.pathname
    if (p.length > 1 && p.charAt(p.length - 1) === '/') {
        return p.slice(0, p.length - 1)
    }
    return p
}

function setMainBodyHTML(main) {
    const elemMain = document.querySelector("div .main");

    if (elemMain !== null && document.querySelector("header-bar") !== null) {
        elemMain.innerHTML = main;
    } else {
        document.body.innerHTML = `
        <header-bar></header-bar>
        <div class="main">
        ${main}   
        </div>`
    }
}


window.addEventListener("popstate", e => {
    e.preventDefault();
    router()
})

router()
checkLoggedIn()
