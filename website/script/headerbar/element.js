
class headerBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
                <a is="a-button" href="/"><h1>Stock Viewer</h1></a>
                <nav class="move">
                    <a is="a-button" href="/stocks">${getTranslatedStr("header.stocks")}</a>
                    <a is="a-button" href="/articles">${getTranslatedStr("header.articles")}</a>
                    <a is="a-button" href="/groups">${getTranslatedStr("header.stock_groups")}</a>
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
