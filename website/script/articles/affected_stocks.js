class affectedStocks extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <h2>Affected stocks</h2>
                <p>Loading stock data...</p>
            </div>`
    }

    disconnectedCallback() {
        if (this.closeSubscription !== null) {
            this.closeSubscription()
        }
    }

    setData(stockIDs, influences) {
        this.influences = influences
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/sse/?members=${stockIDs}`, addThisToFunctionCall(this.updateData, this))
    }

    updateData(data, that) {
        let html = ""
        if (data["Members"] === null || data["Members"] === undefined) {
            that.innerHTML = `<div class="inner">
                <nav><h2>Affected stocks</h2></nav>
                <p>This article doesn't affect any stocks...</p>
            </div>`
            return
        }
        const stocks = data["Members"]

        stocks.forEach((stock, i) => {
            const shortPrice = getShortNumber(stock["Price"]/100)
            const color = `#${getHexColor(Number(stock["Color"]))}`
            const influence = that.influences.find(infl => infl["StockID"] === stock["ID"])

            html += `<li class="stockOverview"  data-stock-id="${stock["ID"]}">
                            <a class="containing" is="a-button" href="/stocks/${stock["ID"]}">
                                <div class="identification">
                                    <div class="change shorthand ${Number(stock["Color"]) === -1 ? "" : "colored"}" style="background-color: ${color}">${sanitiseText(stock["Shorthand"]).toUpperCase()}</div> 
                                    <div class="stockName">${sanitiseText(stock["Name"])}</div>
                                </div>
                                <div class="info">
                                    <div class="change">${shortPrice}</div>
                                    <div class="change">${influence["PermillePerDay"]}&permil;/day</div>
                                    <div class="change">${influence["LengthMinutes"]}m</div>
                                </div>
                            </a>
                        </li>`
        })

        that.innerHTML = `<ul class="inner">
                        <div class="titlebar">
                            <div></div>
                            <h2>Affected stocks</h2>
                            <div></div>
                        </div>
                        ${html}
                    </ul>
                `
    }

}



customElements.define('influenced-stocks', affectedStocks);
