class relatedStocks extends HTMLElement {
    connectedCallback() {
        this.stockid = Number(this.getAttribute("data-stock-id"))
        let template = ""

        for (let i = 0; i < 5; i++) {
            template += `<li class="stockOverview">
                            <a class="containing" is="a-button" href="/stocks">
                                <div class="stockName">Loading...</div>
                                <div class="info">
                                    <div class="change">???</div>
                                    <div class="change">+???€</div>
                                    <div class="change">???%</div>
                                </div>
                            </a>
                        </li>`
        }

        this.innerHTML = `
                        <ul class="inner">
                            <h2>Related Stocks</h2>
                            ${template}                    
                        </ul>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stocks/sse/`, addThisToFunctionCall(this.updateData, this))
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        const sorted = data.sort((a, b) => a["Price"] - b["Price"])
        const thisStock = sorted.filter(e => e["ID"] === that.stockid)[0]
        const thisStockIndex = sorted.indexOf(thisStock)


        let elements = ""

        const addNoneElement = () => {
            elements += `<li class="stockOverview">
                        <a class="containing" is="a-button" href="/stocks">
                            <div class="stockName"><div class="change shorthand">????</div> None...</div>                       
                            <div class="info">
                                <div class="change">---</div>
                                <div class="change">--€</div>
                                <div class="change">--%</div>
                            </div>
                        </a>
                    </li>`
        }
        const addComparingElement = (elem) => {
            elements += `<li class="stockOverview">
                        <a class="containing" is="a-button" href="/stocks/${elem["ID"]}">
                            <div class="identification">
                                <div class="change shorthand">${sanitiseText(elem["Shorthand"]).toUpperCase()}</div>
                                <div class="stockName">${sanitiseText(elem["Name"])}</div>
                            </div>
                            <div class="info">
                                <div class="change">${getShortNumber(elem["Price"]/100)}</div>
                                <div class="change">${(elem["Price"] - thisStock["Price"] >= 0 ? "+" : "") + getShortNumber(((elem["Price"] - thisStock["Price"])/100))}</div>
                                <div class="change">${getShortNumber(((elem["Price"]/thisStock["Price"]) * 100))}%</div>
                            </div>
                        </a>
                    </li>`
        }

        if (thisStockIndex !== sorted.length - 1) {
            addComparingElement(sorted[sorted.length - 1])
        } else {
            addNoneElement()
        }

        if (thisStockIndex + 1 < sorted.length - 1) {
            addComparingElement(sorted[thisStockIndex + 1])
        } else {
            addNoneElement()
        }

        addComparingElement(thisStock)

        if (thisStockIndex - 1 > 0) {
            addComparingElement(sorted[thisStockIndex - 1])
        } else {
            addNoneElement()
        }

        if (thisStockIndex !== 0) {
            addComparingElement(sorted[0])
        } else {
            addNoneElement()
        }

        that.innerHTML = `
                        <ul class="inner">
                            <h2>Related Stocks</h2>
                            ${elements}                    
                        </ul>
                        `
    }
}

customElements.define('related-stocks', relatedStocks);

