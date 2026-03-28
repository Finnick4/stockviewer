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
                            <nav class="buttons">
                                <button is="star-stock-group-button" data-stock-group-id="${this.groupid}"></button>
                                <button is="edit-stock-group-button" data-stock-group-id="${this.groupid}"></button>
                            </nav>
                        </div>
                        `
        if (this.groupid < 0) {
            this.querySelector("nav.buttons").innerHTML = ""
        }
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/${this.groupid}/sse`, addThisToFunctionCall(this.updateData, this))
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        console.log(data)
        that.querySelector("h1").innerHTML = sanitiseText(data["Name"])
        let totalValue = 0
        let memberCount = 0
        if (data["Members"] !== undefined) {
            data["Members"].forEach(stock => totalValue += stock["Price"])
            memberCount = data["Members"].length
        }
        that.querySelector("div.price").innerHTML = getLocaleString(totalValue/100) + "€"
        that.querySelector("div.members").innerHTML = memberCount + " stocks"
        if (Number(that.groupid) >= 0) {
            that.querySelector("nav button.star").updateStatus(data["IsStarred"])
        }
    }
}

customElements.define('stock-group-header', stockGroupHeader);

