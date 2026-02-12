class createDataElement extends HTMLElement {
    connectedCallback() {
        this.dropdownid = createDropdown(`<button onclick="showModalCreateStock(this)">Create Stock</button>
                                                <button>Create Stock Group</button>
                                                <button>Create Article</button>
                                                <button onclick="showModalCreateUser(this)">Create User</button>
                                            `)
        this.innerHTML = `<button popovertarget="${this.dropdownid}" style="anchor-name: --anchor-${this.dropdownid};"><img class="icon" src="/icons/plussign.svg" alt="create new" draggable="false"></button>`
    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}



customElements.define('create-data', createDataElement);
