
function checkLoggedIn() {
    if (!document.cookie.includes("isLoggedIn=true")) {
        console.log("not logged in!!!")
        buildPageLogin()
    }
}

function getCurrentPathWithoutSlash() {
    const p = window.location.pathname
    if (p.length > 1 && p.charAt(p.length - 1) === '/') {
        return p.slice(0, p.length - 1)
    }
    return p
}


window.addEventListener("popstate", e => {
    e.preventDefault();
    router()
})

router()
checkLoggedIn()
