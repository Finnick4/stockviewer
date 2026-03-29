class createDataElement extends HTMLElement {
    connectedCallback() {
        this.dropdownid = createDropdown(`<button onclick="showModalCreateStock(this)">${getTranslatedStr("creator.stock")}</button>
                                                <button onclick="showModalCreateStockGroup(this)">${getTranslatedStr("creator.stock_group")}</button>
                                                <button onclick="showModalCreateArticle(this)">${getTranslatedStr("creator.article")}</button>
                                                <button onclick="showModalCreateUser(this)">${getTranslatedStr("creator.user")}</button>
                                            `)
        this.innerHTML = `<button popovertarget="${this.dropdownid}" style="anchor-name: --anchor-${this.dropdownid};"><img class="icon" src="/icons/plussign.svg" alt="create new" draggable="false"></button>`
    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}



customElements.define('create-data', createDataElement);
