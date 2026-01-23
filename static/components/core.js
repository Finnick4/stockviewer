/* classes */

class headerBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
                <h1>Stock Viewer</h1>
                <nav class="move">
                    <a href="${window.location.origin}/stocks">Stocks</a>
                    <a href="${window.location.origin}/articles">Articles</a>
                    <a href="${window.location.origin}/groups">Groups</a>
                </nav>
                <search-bar></search-bar>
                <nav class="create"><create-data></create-data></nav>
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
        this.dropdownid = createDropdown(`This is a test!!!`)
        this.innerHTML = `
        <button popovertarget="${this.dropdownid}" onclick="userManagerMenuToggle(this)" class="usermanager" style="anchor-name: --anchor-${this.dropdownid};">
            <div class="name">USER</div>
            <img class="icon" src="/icons/user.svg" alt="user icon" draggable="false">
        </button>`

    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}

class searchBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<input type="text" placeholder="Search..">`
    }
}

class createDataElement extends HTMLElement {
    connectedCallback() {
        this.dropdownid = createDropdown(`<button>Create Stock</button>
                                                <button>Create Stock Group</button>
                                                <button>Create Article</button>
                                                <button>Create User</button>
                                            `)
        this.innerHTML = `<button popovertarget="${this.dropdownid}" style="anchor-name: --anchor-${this.dropdownid};"><img class="icon" src="/icons/plussign.svg" alt="create new" draggable="false"></button>`
    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}


let modalCount = 0

function createModal(html) {
    let modal = document.createElement("div")
    modal.className = "modal"
    modal.id = "modal-" + modalCount
    modal.innerHTML = `<div class="content">
        <span class="closeBtn" onClick="closeModal('${modalCount}')">&times;</span>
        <div>${html}</div>
    </div>`
    modal.addEventListener("click", x => {
        if (x.target === modal) {
            closeModal(modal.id)
        }
    })
    document.body.insertBefore(modal,document.body.childNodes[0]);
    modalCount++
}


function closeModal(id) {
    document.body.removeChild(document.getElementById(id))
}

let dropdownCount = 0

function createDropdown(html) {
    let dropdown = document.createElement("div")
    dropdown.className = "dropdown"
    dropdown.id = "dropdown-" + dropdownCount
    dropdown.innerHTML = html
    dropdown.setAttribute("popover", "auto")
    dropdown.setAttribute("style", `position-anchor: --anchor-${dropdown.id};`)

    document.body.insertBefore(dropdown, document.body.childNodes[0]);
    dropdownCount++
    return dropdown.id
}

function deleteDropdown(id) {
    document.body.removeChild(document.getElementById(id))
}

/* functions */
function userManagerMenuToggle(elem) {
    console.log("This is a demo of the button!")
    //createModal(`<h2>DEMO!!!</h2><p>This is a sample modal</p>`)
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
customElements.define('create-data', createDataElement);
