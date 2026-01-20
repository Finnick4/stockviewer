/* classes */

class headerBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
                <h1>Stock Viewer</h1>
                <nav>
                    <a href="${window.location.origin}/stocks">Stocks</a>
                    <a href="${window.location.origin}/articles">Articles</a>
                    <a href="${window.location.origin}/groups">Groups</a>
                </nav>
                <search-bar></search-bar>
                <site-manager></site-manager>
                `
    }
}

class siteManagementElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <theme-switcher></theme-switcher>
            <user-manager></user-manager>
        `
    }
}

class themeSwitcherElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button onclick="themeSwitcherSwitch(this)"><img class="icon" src="/icons/lightmode.svg" alt="switch dark-/lightmode" draggable="false"></button>`
    }
}

class userManagerElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <button onclick="userManagerMenuToggle(this)" class="usermanager">
            <div class="name">USER</div>
            <img class="icon" src="/icons/user.svg" alt="user icon" draggable="false">
        </button>`
    }
}

class searchBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<input type="text" placeholder="Search..">`
    }
}

class modalElement extends HTMLElement {
    connectedCallback() {
        this.setAttribute("data-hidden", "true")
        let html = this.getAttribute("data-content")
        console.log(this.id)
        this.innerHTML = `<div class="content">
                <span class="closeBtn" onclick="closeModal('${this.id}')">&times;</span>
                <div>${html}</div>
            </div>`
        document.getElementById(this.id).addEventListener("click", x => {
            if (x.target === document.getElementById(this.id)) {
                closeModal(this.id)
            }
        })
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "data-content") {
            this.innerHTML = `<div class="content">
                <span class="closeBtn" onclick="closeModal('${this.id}')">&times;</span>
                <div>${newValue}</div>
            </div>`
        }
    }
}

function openModal(id) {
    let elem = document.getElementById(id)
    elem.setAttribute("data-hidden", "false")
}
function closeModal(id) {
    let elem = document.getElementById(id)
    elem.setAttribute("data-hidden", "true")
}

/* functions */
function userManagerMenuToggle(elem) {
    console.log("This is a demo of the button!")
    openModal("login")
}

function themeSwitcherSwitch(elem) {
    if (document.querySelector("body").getAttribute("data-theme") === "light") {
        elem.innerHTML = `<img class="icon" src="/icons/lightmode.svg" alt="switch to lightmode" draggable="false">`
        document.querySelector("body").setAttribute("data-theme", "dark")
    } else {
        elem.innerHTML = `<img class="icon" src="/icons/darkmode.svg" alt="switch to darkmode" draggable="false">`
        document.querySelector("body").setAttribute("data-theme", "light")
    }
}


/* adding to elements */
customElements.define('header-bar', headerBarElement);
customElements.define('theme-switcher', themeSwitcherElement);
customElements.define('user-manager', userManagerElement);
customElements.define('site-manager', siteManagementElement);
customElements.define('search-bar', searchBarElement);
customElements.define('modal-elem', modalElement);
