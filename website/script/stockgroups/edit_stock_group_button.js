
class editStockGroupButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.groupid = Number(this.dataset.stockGroupId)

        this.classList.add("edit")
        this.modalhtml = `
            <h1>This is not yet implemented!</h1>
            <p>In the future you will be able to edit stock group ${this.groupid} with this button!</p>
        `
        this.onclick = () => createModal(this.modalhtml)

        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="edit" draggable="false">`
    }

}

customElements.define('edit-stock-group-button', editStockGroupButtonElement, {extends: "button"});

