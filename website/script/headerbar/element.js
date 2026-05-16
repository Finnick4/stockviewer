
class headerBarElement extends HTMLElement {
    connectedCallback() {
        const userWantsSidebar = localStorage.getItem("headerAsSidebar") === "true"
        let isSidebar = false

        this.classList.add("shown")
        if (userWantsSidebar) {
            this.classList.add("side")
            isSidebar = true
        }

        const externalToggle = new sidebarToggleElement()
        externalToggle.classList.add("external")
        document.querySelector("body").appendChild(externalToggle)

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
                        <div class="label">${getTranslatedStr("stockgroups.anonymous.icon_alt_text")}</div>
                    </button>
                </nav>
                <nav class="site-manager">
                    <theme-switcher></theme-switcher>
                    <user-manager></user-manager>
                    <sidebar-toggle></sidebar-toggle>
                </nav>
                <nav class="linklist"></nav>
                `
        externalToggle.updateIcon()
        const searchBar = this.querySelector("search-bar")

        const checkToggleSidebar = () => {
            if (window.innerWidth < 1300) {
                if (!isSidebar) {
                    this.classList.add("side")
                    isSidebar = true
                    externalToggle.updateIcon()
                }
            } else {
                if (isSidebar && !userWantsSidebar) {
                    this.classList.remove("side")
                    isSidebar = false
                }
            }
            searchBar.updateSearchDropdownWidth()
        }

        window.addEventListener("resize", checkToggleSidebar)
        checkToggleSidebar()
    }
}

customElements.define('header-bar', headerBarElement);
