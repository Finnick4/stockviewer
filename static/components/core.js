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

class siteManagerElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button onclick="userManagerMenuToggle(this)" class="usermanager"><div class="name">USER</div> <img class="icon" src="/icons/user.svg" alt="user icon" draggable="false"></button>`
    }
}

function userManagerMenuToggle(elem) {
    console.log("This is a demo of the button!")
}

class searchBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<input type="text" placeholder="Search..">`
    }
}


customElements.define('header-bar', headerBarElement);
customElements.define('site-manager', siteManagerElement);
customElements.define('search-bar', searchBarElement);



