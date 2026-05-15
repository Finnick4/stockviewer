class stockHeader extends HTMLElement {
    connectedCallback() {
        this.stockid = Number(this.getAttribute("data-stock-id"))

        this.innerHTML = `
                        <div class="titlebar">
                            <div class="info">
                                <div class="value priceDisplay">???€</div>
                                <div class="value shorthand">?????</div>
                            </div>
                            <h1>Loading name...</h1>
                            <nav>
                                <button is="star-stock-button" data-stock-id="${this.stockid}"></button>
                                ${userInfo.hasAnyEditStockPermissions ? `<button is="edit-stock-button" data-stock-id="${this.stockid}"></button>` : ""}
                            </nav>
                        </div>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stocks/${this.stockid}/sse`, addThisToFunctionCall(this.updateData, this))
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        that.querySelector("h1").innerHTML = sanitiseText(data["Name"])
        that.querySelector("div.priceDisplay").innerHTML = getLocaleString(data["Price"]/100) + "€"
        const shorthandElem = that.querySelector("div.shorthand")
        shorthandElem.innerHTML = sanitiseText(data["Shorthand"]).toUpperCase()
        shorthandElem.style.backgroundColor = `#${getHexColor(Number(data["Color"]))}`
        shorthandElem.classList.remove("colored", "dark", "light")
        shorthandElem.classList.add(Number(data.Color) === -1 ? "" : "colored", shouldUseDarkText(getHexColor(data.Color)) ? "dark" : "light")
        that.querySelector("nav button.star").updateStatus(data["IsStarred"])
    }
}

customElements.define('stock-header', stockHeader);

