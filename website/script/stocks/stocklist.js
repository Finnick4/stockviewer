class stocklistAll extends HTMLElement {
    connectedCallback() {
        this.timeframe = 1
        this.innerHTML = `<div class="inner">
                <h2>All stocks</h2>
                <p>Loading stock data...</p>
            </div>`
        this.closeSubscription = subscribeToAPI(`/api/stocks/?Timeframe=${this.timeframe}`, addThisToFunctionCall(this.updateData, this))
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        let html = ""
        data.forEach(e => {
            const shortPrice = getShortPrice(e["Price2"]/100)
            html += `<li class="stockoverview"  data-stock-id="${e["ID"]}">
                            <a is="a-button" href="/stocks/${e["ID"]}">
                                <div class="stockname">${e["Name"]}</div>
                                <div class="${e["DeltaAmount"] >= 0 ? "positive" : "negative"}">
                                    <div class="change">${shortPrice}</div>
                                    <div class="change">${e["DeltaAmount"] / 100}€</div>
                                    <div class="change">${(e["Price2"]/e["Price1"] - 1.0).toFixed(2)}%</div>
                                </div>
                            </a>
                        </li>`
        })

        that.innerHTML = `<ul class="inner">
                        <h2>All stocks</h2>
                        ${html}
                    </ul>
                `
    }
}



customElements.define('stocklist-all', stocklistAll);
