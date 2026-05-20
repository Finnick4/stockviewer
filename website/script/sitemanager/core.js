
function checkLoggedIn() {
    if (!document.cookie.includes("isLoggedIn=true")) {
        console.log("not logged in!!!")
        window.history.pushState(null, null, `${window.location.origin}/login`)
        buildPageLogin()
    } else {
        initialiseUserInfo().then(() => {
            router()
        })
    }
}

function logout() {
    console.log("Logging out!")
    fetch("/api/users/login", {
        method: "DELETE"
    })
    document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    checkLoggedIn()
}


function getCurrentPathWithoutSlash() {
    const p = window.location.pathname
    if (p.length > 1 && p.charAt(p.length - 1) === '/') {
        return p.slice(0, p.length - 1)
    }
    return p
}

function setMainBodyHTML(main, mainClasses) {
    if (typeof(mainClasses) === "undefined") {
        mainClasses = ""
    }
    const elemMain = document.querySelector("main");
    const side = document.querySelector("header-bar nav.linklist");

    if (elemMain !== null && side !== null && document.querySelector("header-bar") !== null) {
        elemMain.innerHTML = main
        side.innerHTML = ""
        elemMain.className = mainClasses
    } else {
        document.body.innerHTML = `
        <header-bar></header-bar>
        <main class="${mainClasses}">
        ${main}   
        </main>`
        document.querySelector("header-bar nav.linklist").innerHTML = ""
    }
    document.querySelector("header-bar nav.move").querySelector("a.selected")?.classList.remove("selected")
    const header = document.querySelector("header-bar")
    header.imposedSidebar = false
    header.checkToggleSidebar()
}

function setMainBodyHTMLAndSidebar(main, sidebar, mainClasses) {
    const elemMain = document.querySelector("main");
    const side = document.querySelector("header-bar nav.linklist");

    if (elemMain !== null && side !== null && document.querySelector("header-bar") !== null) {
        elemMain.innerHTML = main;
        side.innerHTML = sidebar;
        elemMain.className = mainClasses
    } else {
        document.body.innerHTML = `
        <header-bar></header-bar>
        <main class="${mainClasses}">
            ${main}   
        </main>`
        document.querySelector("header-bar nav.linklist").innerHTML = sidebar
    }
    document.querySelector("header-bar nav.move").querySelector("a.selected")?.classList.remove("selected")
    const header = document.querySelector("header-bar")
    header.imposedSidebar = true
    header.checkToggleSidebar()
}



window.addEventListener("popstate", e => {
    e.preventDefault();
    router()
})

changeLanguage(undefined, true)
checkLoggedIn()
