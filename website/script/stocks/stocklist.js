class stocklistAll extends HTMLElement {
    connectedCallback() {
        this.timeframe = 1
        this.innerHTML = `<div class="stocklist">
                <h2>All stocks</h2>
                <p>Loading stock data...</p>
            </div>`
        subscribeToAPI(`/api/stocks/?Timeframe=${this.timeframe}`, addThisToFunctionCall(this.updateData, this))
    }

    updateData(data, that) {
        let html = ""
        data.forEach(e => {
            let shortPrice = (e["Price2"]/100).toLocaleString('en-US', {
                maximumFractionDigits: 2,
                notation: 'compact',
                compactDisplay: 'short'
            });
            html += `<div class="stockoverview"  data-stock-id="${e["ID"]}">
                            <a is="a-button" class="stockname" href="${window.location.origin}/stocks/${e["ID"]}">${e["Name"]}</a>
                            <div class="${e["DeltaAmount"] >= 0 ? "positive" : "negative"}">
                                <div class="change">${shortPrice}</div>
                                <div class="change">${e["DeltaAmount"] / 100}€</div>
                                <div class="change">${(e["Price2"]/e["Price1"] - 1.0).toFixed(2)}%</div>
                            </div>
                        </div>`
        })

        that.innerHTML = `<div class="stocklist">
                        <h2>All stocks</h2>
                        ${html}
                    </div>
                `
    }
}



customElements.define('stocklist-all', stocklistAll);
