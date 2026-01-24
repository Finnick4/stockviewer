
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
                <nav class="site-manager">
                    <theme-switcher></theme-switcher>
                    <user-manager></user-manager>
                </nav>
                `
    }
}

customElements.define('header-bar', headerBarElement);
