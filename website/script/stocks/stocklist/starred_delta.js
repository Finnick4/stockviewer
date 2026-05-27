class stocklistStarredDelta extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="inner">
                <div class="titlebar">
                    <timeframe-selector></timeframe-selector>
                    <h2>${getTranslatedStr("stocks.starred_list.title")}</h2>
                    <div></div>
                </div>
                
                <div class="contentTable grid-1-name-3">
                    <p>${getTranslatedStr("stocks.starred_list.loading")}</p>
                </div>
            </div>`

        const tfSelector = this.querySelector("timeframe-selector")
        tfSelector.onEdit = () => {
            this.changeTimeframe(tfSelector.value, this)
        }
        this.timeframe = tfSelector.value


        this.closeSubscription = subscribeToAPI(`/api/stocks/starred/sse/?Timeframe=${this.timeframe}`, addThisToFunctionCall(this.updateData, this))
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    changeTimeframe(tf, that) {
        that.timeframe = tf
        that.closeSubscription()
        that.closeSubscription = subscribeToAPI(`/api/stocks/starred/sse/?Timeframe=${that.timeframe}`, addThisToFunctionCall(that.updateData, that))
    }

    updateData(data, that) {
        const contentTable = that.querySelector(".contentTable")
        if (data === null) {
            contentTable.innerHTML = `<p class="grid-full-width">${getTranslatedStr("stocks.starred_list.none")}</p>`
            return
        }

        let html = ""
        data.forEach(e => {
            const shortPrice = getShortNumber(e["Price2"]/100)
            html += `
                <a class="containing" is="a-button" href="/stocks/${e["ID"]}" data-stock-id="${e["ID"]}">
                    <div class="shorthand ${Number(e["Color"]) === -1 ? "" : "colored"} ${shouldUseDarkText(getHexColor(Number(e["Color"]))) ? "dark" : "light"}" style="background-color: #${getHexColor(Number(e["Color"]))}">${sanitiseText(e["Shorthand"]).toUpperCase()}</div>
                    <div class="name">${sanitiseText(e["Name"])}</div>
                    <button is="star-stock-button" data-stock-id="${e.ID}"></button>
                    <div class="value">${shortPrice}</div>
                    <div class="value">${(e["Price2"]-e["Price1"]) >= 0 ? "+" : ""}${getShortNumber((e["Price2"]-e["Price1"]) / 100)}€</div>
                    <div class="value">${getShortNumber((e["Price2"]/e["Price1"] - 1.0)*100)}%</div>
                </a>`
        })

        contentTable.innerHTML = html
        that.querySelectorAll("button.star").forEach(btn => {
            btn.updateStatus(true)
            btn.addEventListener("click", e => {
                e.preventDefault()
                e.stopPropagation()
            })
        })
    }
}



customElements.define('stock-list-starred-delta', stocklistStarredDelta);
