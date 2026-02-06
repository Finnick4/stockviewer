class relatedStocks extends HTMLElement {
    connectedCallback() {
        this.stockid = Number(this.getAttribute("data-stock-id"))
        let template = ""

        for (let i = 0; i < 5; i++) {
            template += `<li class="stockoverview">
                                <a is="a-button" class="stockname" href="/stocks">Loading...</a>
                                <div>
                                    <div class="change">???</div>
                                    <div class="change">+???€</div>
                                    <div class="change">???%</div>
                                </div>
                            </li>`
        }

        this.innerHTML = `
                        <ul class="inner">
                            <h2>Related Stocks</h2>
                            ${template}                    
                        </ul>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stocks/`, addThisToFunctionCall(this.updateData, this))
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        const sorted = data.sort((a, b) => a["Price"] - b["Price"])
        const thisStock = sorted.filter(e => e["Id"] === that.stockid)[0]
        const thisStockIndex = sorted.indexOf(thisStock)


        let elements = ""

        const addNoneElement = () => {
            elements += `<li class="stockoverview">
                        <a is="a-button" href="/stocks">
                            <div class="stockname">None...</div>                       
                            <div>
                                <div class="change">---</div>
                                <div class="change">+-€</div>
                                <div class="change">--%</div>
                            </div>
                        </a>
                    </li>`
        }
        const addComparingElement = (elem) => {
            elements += `<li class="stockoverview">
                        <a is="a-button" href="/stocks/${elem["Id"]}">
                            <div class="stockname">${elem["Name"]}</div>
                            <div>
                                <div class="change">${getShortPrice(elem["Price"]/100)}</div>
                                <div class="change">${getShortPrice(((elem["Price"] - thisStock["Price"])/100))}</div>
                                <div class="change">${(elem["Price"]/thisStock["Price"] - 1.0).toFixed(2)}%</div>
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

