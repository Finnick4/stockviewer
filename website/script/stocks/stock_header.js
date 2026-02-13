class stockHeader extends HTMLElement {
    connectedCallback() {
        this.stockid = Number(this.getAttribute("data-stock-id"))

        this.innerHTML = `
                        <div class="titlebar">
                            <div>
                                <div class="change price">???€</div>
                            </div>
                            <h1>Loading name...</h1>
                            <nav>
                                <button is="star-stock-button" data-stockid="${this.stockid}"></button>
                                <button is="edit-stock-button" data-stockid="${this.stockid}"></button>
                            </nav>
                        </div>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stocks/?Id=${this.stockid}`, addThisToFunctionCall(this.updateData, this))
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        that.querySelector("h1").innerHTML = data["Name"]
        that.querySelector("div.price").innerHTML = data["Price"]/100 + "€"
    }
}

customElements.define('stock-header', stockHeader);

