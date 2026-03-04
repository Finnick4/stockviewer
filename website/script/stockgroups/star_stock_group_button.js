
class starStockGroupButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.groupid = Number(this.dataset.stockGroupId)



        this.modalhtml = `
            <h1>This is not yet implemented!</h1>
            <p>In the future you will be able to star stock group ${this.stockid} with this button!</p>
        `
        this.classList.add("star")
        this.onclick = () => createModal(this.modalhtml)

        this.innerHTML = `<img class="icon" src="/icons/star_empty.svg" alt="give star" draggable="false">`
    }
}

customElements.define('star-stock-group-button', starStockGroupButtonElement, {extends: "button"});
