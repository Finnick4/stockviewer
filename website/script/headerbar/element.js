
class headerBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
                <a is="a-button" href="/"><h1>Stock Viewer</h1></a>
                <nav class="move">
                    <a is="a-button" href="/stocks">Stocks</a>
                    <a is="a-button" href="/articles">Articles</a>
                    <a is="a-button" href="/groups">Groups</a>
                </nav>
                <search-bar></search-bar>
                <nav class="create"></nav>
                <nav class="site-manager">
                    <theme-switcher></theme-switcher>
                    <user-manager></user-manager>
                </nav>
                `
        userInformation.hasAnyCreatePermissions(b => {
            if (b) {
                this.querySelector(".create").innerHTML = "<create-data></create-data>"
            }
        })
    }
}

customElements.define('header-bar', headerBarElement);
