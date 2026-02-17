
function checkLoggedIn() {
    if (!document.cookie.includes("isLoggedIn=true")) {
        console.log("not logged in!!!")
        window.history.pushState(null, null, `${window.location.origin}/login`)
        buildPageLogin()
    }
}

function logout() {
    console.log("Logging out!")
    fetch("/api/users/login", {
        method: "DELETE"
    })
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
    const elemMain = document.querySelector("main");
    const side = document.querySelector("div.sidebar");

    if (elemMain !== null && side === null && document.querySelector("header-bar") !== null) {
        elemMain.innerHTML = main;
    } else {
        document.body.innerHTML = `
        <header-bar></header-bar>
        <main>
        ${main}   
        </main>`
    }
}

function setMainBodyHTMLAndSidebar(main, sidebar) {
    const elemMain = document.querySelector("main");
    const side = document.querySelector("div.sidebar");

    if (elemMain !== null && side !== null && document.querySelector("header-bar") !== null) {
        elemMain.innerHTML = main;
        side.innerHTML = sidebar;
    } else {
        document.body.innerHTML = `
        <header-bar></header-bar>
        <div class="rootsplit">
            <div class="sidebar">
                ${sidebar}
            </div>
            <main>
                ${main}   
            </main>
        </div>`
    }
}



window.addEventListener("popstate", e => {
    e.preventDefault();
    router()
})

router()
checkLoggedIn()
