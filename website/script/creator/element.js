class createDataElement extends HTMLElement {
    connectedCallback() {
        this.dropdownid = createDropdown(`<button onclick="showModalCreateStock(this)">${lang.creator.stock}</button>
                                                <button onclick="showModalCreateStockGroup(this)">${lang.creator.stock_group}</button>
                                                <button onclick="showModalCreateArticle(this)">${lang.creator.article}</button>
                                                <button onclick="showModalCreateUser(this)">${lang.creator.user}</button>
                                            `)
        this.innerHTML = `<button popovertarget="${this.dropdownid}" style="anchor-name: --anchor-${this.dropdownid};"><img class="icon" src="/icons/plussign.svg" alt="create new" draggable="false"></button>`
    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}



customElements.define('create-data', createDataElement);
