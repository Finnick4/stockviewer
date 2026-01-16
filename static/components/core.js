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
                <user-manager></user-manager>
                `
    }
}

class userManagerElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div>USER</div>`
    }
}

class searchBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<input type="text" placeholder="Search..">`
    }
}


customElements.define('header-bar', headerBarElement);
customElements.define('user-manager', userManagerElement);
customElements.define('search-bar', searchBarElement);



