
class starStockButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.stockid = Number(this.dataset.stockId)
        this.isStarred = this.dataset.isStarred === "true"

        this.modalhtml = `
            <h1>This is not yet implemented!</h1>
            <p>In the future you will be able to star stock ${this.stockid} with this button!</p>
        `
        this.classList.add("star")
        this.onclick = () => {
            const isStarred = this.isStarred
            fetch("/api/stocks/star", {
                method: "PUT",
                body: JSON.stringify({
                    id: this.stockid,
                    result: !isStarred
                })
            }).catch(r => {
                this.updateStatus(isStarred)
            })
            this.updateStatus(!isStarred)
        }

        this.innerHTML = `<img class="icon" src="/icons/star_${this.isStarred ? "filled" : "empty"}.svg" alt="give star" draggable="false">`
    }
    updateStatus(newStatus) {
        this.isStarred = newStatus === "true" || newStatus === true
        this.innerHTML = `<img class="icon" src="/icons/star_${this.isStarred ? "filled" : "empty"}.svg" alt="give star" draggable="false">`
    }
}

customElements.define('star-stock-button', starStockButtonElement, {extends: "button"});
