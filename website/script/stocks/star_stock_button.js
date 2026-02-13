
class starStockButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.stockid = this.getAttribute("data-stockid")

        this.modalhtml = `
            <h1>This is not yet implemented!</h1>
            <p>In the future you will be able to star stock ${this.stockid} with this button!</p>
        `
        this.classList.add("edit")
        this.onclick = () => createModal(this.modalhtml)

        this.innerHTML = `<img class="icon" src="/icons/star_empty.svg" alt="give star" draggable="false">`
    }
}

customElements.define('star-stock-button', starStockButtonElement, {extends: "button"});
