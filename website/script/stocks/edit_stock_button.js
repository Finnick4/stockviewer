
class editStockButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.stockid = this.getAttribute("data-stockid")

        this.modalhtml = `
            <h1>This is not yet implemented!</h1>
            <p>In the future you will be able to edit stock ${this.stockid} here!</p>
        `
        this.classList.add("edit")
        this.onclick = () => createModal(this.modalhtml)

        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="edit" draggable="false">`
    }
}

customElements.define('edit-stock-button', editStockButtonElement, {extends: "button"});
