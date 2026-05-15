class affectedStocks extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <h2>${getTranslatedStr("articles.affected_stocks.title")}</h2>
                <p>${getTranslatedStr("articles.affected_stocks.loading")}</p>
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
                <nav><h2>${getTranslatedStr("articles.affected_stocks.title")}</h2></nav>
                <p>${getTranslatedStr("articles.affected_stocks.no_stocks_affected")}</p>
            </div>`
            return
        }
        const stocks = data["Members"]

        stocks.forEach((stock, i) => {
            const shortPrice = getShortNumber(stock["Price"]/100)
            const color = `#${getHexColor(Number(stock["Color"]))}`
            const influence = that.influences.find(infl => infl["StockID"] === stock["ID"])

            html += `
                <a class="containing" is="a-button" href="/stocks/${stock["ID"]}" data-stock-id="${stock["ID"]}">
                        <div class="shorthand ${Number(stock["Color"]) === -1 ? "" : "colored"} ${shouldUseDarkText(color) ? "dark" : "light"}" style="background-color: ${color}">${sanitiseText(stock["Shorthand"]).toUpperCase()}</div> 
                        <div class="name">${sanitiseText(stock["Name"])}</div>
                        <div class="value">${shortPrice}</div>
                        <div class="value">${influence["PermillePerDay"]}${getTranslatedStr("articles.permille_per_day")}</div>
                        <div class="value">${influence["LengthMinutes"]}${getTranslatedStr("articles.length_minutes_short")}</div>
                </a>`
        })

        that.innerHTML = `<div class="inner">
                        <div class="titlebar">
                            <div></div>
                            <h2>${getTranslatedStr("articles.affected_stocks.title")}</h2>
                            <div></div>
                        </div>
                        <div class="contentTable grid-1-name-3">
                            ${html}
                        </div>
                    </div>
                `
    }

}



customElements.define('influenced-stocks', affectedStocks);
