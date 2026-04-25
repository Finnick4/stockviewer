class createDataElement extends HTMLElement {
    connectedCallback() {
        let html = ``

        if (userInfo.checkPerm("canCreateStocks")) html += `<button onclick="showModalCreateStock(this)">${getTranslatedStr("creator.stock")}</button>`
        if (userInfo.checkPerm("canCreateStockGroups")) html += `<button onclick="showModalCreateStockGroup(this)">${getTranslatedStr("creator.stock_group")}</button>`
        if (userInfo.checkPerm("canCreateArticles")) html += `<button onclick="showModalCreateArticle(this)">${getTranslatedStr("creator.article")}</button>`
        if (userInfo.checkPerm("canCreateUsers")) html += `<button onclick="showModalCreateUser(this)">${getTranslatedStr("creator.user")}</button>`

        this.dropdownid = createDropdown(html)
        this.innerHTML = `<button popovertarget="${this.dropdownid}" style="anchor-name: --anchor-${this.dropdownid};"><img class="icon" src="/icons/plussign.svg" alt="create new" draggable="false"></button>`
    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}



customElements.define('create-data', createDataElement);
