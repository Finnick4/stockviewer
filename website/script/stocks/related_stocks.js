class relatedStocks extends HTMLElement {
    connectedCallback() {
        this.stockid = Number(this.getAttribute("data-stock-id"))
        let template = ""

        for (let i = 0; i < 5; i++) {
            template += `
                            <a class="containing" is="a-button" href="/stocks">
                                <div class="name">${getTranslatedStr("stocks.related.stock_loading_name")}</div>
                                <div class="value">???</div>
                                <div class="value">+???€</div>
                                <div class="value">???%</div>
                            </a>`
        }

        this.innerHTML = `
                        <div class="inner">
                            <h2>${getTranslatedStr("stocks.related.related_stocks")}</h2>
                            <div class="contentTable grid-0-name-3">
                                ${template}                    
                            </div>
                        </div>
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
            elements += `
                        <a class="containing" is="a-button" href="/stocks">
                            <div class="shorthand">?????</div>
                            <div class="name">${getTranslatedStr("stocks.related.stock_none_name")}</div>
                            <div class="value">---</div>
                            <div class="value">--€</div>
                            <div class="value">--%</div>
                        </a>`
        }
        const addComparingElement = (elem) => {
            elements += `
                        <a class="containing" is="a-button" href="/stocks/${elem["ID"]}">
                            <div class="shorthand ${Number(elem["Color"]) === -1 ? "" : "colored"}" style="background-color: #${getHexColor(elem["Color"])}">${sanitiseText(elem["Shorthand"]).toUpperCase()}</div>
                            <div class="name">${sanitiseText(elem["Name"])}</div>
                            <div class="value">${getShortNumber(elem["Price"]/100)}</div>
                            <div class="value">${(elem["Price"] - thisStock["Price"] >= 0 ? "+" : "") + getShortNumber(((elem["Price"] - thisStock["Price"])/100))}</div>
                            <div class="value">${getShortNumber(((elem["Price"]/thisStock["Price"]) * 100))}%</div>
                        </a>`
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
                        <div class="inner">
                            <h2>${getTranslatedStr("stocks.related.related_stocks")}</h2>
                            <div class="contentTable grid-1-name-3">                            
                                ${elements}
                            </div>
                        </div>
                        `
    }
}

customElements.define('related-stocks', relatedStocks);

