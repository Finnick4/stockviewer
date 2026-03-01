class stockGroupHeader extends HTMLElement {
    connectedCallback() {
        this.groupid = Number(this.dataset.stockGroupId)

        this.innerHTML = `
                        <div class="titlebar">
                            <div>
                                <div class="change price">???€</div>
                                <div class="change members">??? stocks</div>
                            </div>
                            <h1>Loading name...</h1>
                            <nav>
                                <button is="star-stock-group-button" data-stock-group-id="${this.groupid}"></button>
                                <button is="edit-stock-group-button" data-stock-group-id="${this.groupid}"></button>
                            </nav>
                        </div>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/sse/?Id=${this.groupid}`, addThisToFunctionCall(this.updateData, this))
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        that.querySelector("h1").innerHTML = sanitiseText(data["Name"])
        let totalValue = 0
        data["Members"].forEach(stock => totalValue += stock["Price"])
        that.querySelector("div.price").innerHTML = totalValue/100 + "€"
        that.querySelector("div.members").innerHTML = data["Members"].length + " stocks"
    }
}

customElements.define('stock-group-header', stockGroupHeader);

