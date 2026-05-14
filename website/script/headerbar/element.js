
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
                <nav class="create">
                    ${userInfo.hasAnyCreatePermissions ? "<create-data></create-data>" : ""}
                    <button onclick="showModalEditAnonymousStockGroup(true)" title="${getTranslatedStr("stockgroups.anonymous.icon_alt_text")}">
                        <img class="icon" src="/icons/compare.svg" alt="${getTranslatedStr("stockgroups.anonymous.icon_alt_text")}" draggable="false">
                    </button>
                </nav>
                <nav class="site-manager">
                    <theme-switcher></theme-switcher>
                    <user-manager></user-manager>
                </nav>
                `
    }
}

customElements.define('header-bar', headerBarElement);
