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
                                <button is="star-stock-button" data-stock-id="${this.stockid}"></button>
                                <button is="edit-stock-button" data-stock-id="${this.stockid}"></button>
                            </nav>
                        </div>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stocks/sse/?Id=${this.stockid}`, addThisToFunctionCall(this.updateData, this))
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        console.log(data)
        that.querySelector("h1").innerHTML = sanitiseText(data["Name"])
        that.querySelector("div.price").innerHTML = getLocaleString(data["Price"]/100) + "€"
        that.querySelector("nav button.star").updateStatus(data["IsStarred"])
    }
}

customElements.define('stock-header', stockHeader);

