
class starStockButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.stockid = Number(this.dataset.stockId)
        this.isStarred = this.dataset.isStarred === "true"

        this.classList.add("star")
        this.onclick = () => {
            const isStarred = this.isStarred
            fetch(`/api/stocks/${this.stockid}/star`, {
                method: "PUT",
                body: JSON.stringify({
                    result: !isStarred
                })
            }).catch(() => {
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
