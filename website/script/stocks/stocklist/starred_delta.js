class stocklistStarredDelta extends HTMLElement {
    connectedCallback() {
        this.timeframe = 1
        this.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stocks.starred_list.title")}</h2></nav>
                <p>${getTranslatedStr("stocks.starred_list.loading")}</p>
            </div>`
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
        if (data === null) {
            that.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stocks.starred_list.title")}</h2></nav>
                <p>${getTranslatedStr("stocks.starred_list.none")}</p>
            </div>`
            return
        }

        let html = ""
        data.forEach(e => {
            const shortPrice = getShortNumber(e["Price2"]/100)
            html += `
                <a class="containing" is="a-button" href="/stocks/${e["ID"]}" data-stock-id="${e["ID"]}">
                    <div class="shorthand ${Number(e["Color"]) === -1 ? "" : "colored"}" style="background-color: #${getHexColor(Number(e["Color"]))}">${sanitiseText(e["Shorthand"]).toUpperCase()}</div>
                    <div class="name">${sanitiseText(e["Name"])}</div>
                    <div class="value">${shortPrice}</div>
                    <div class="value">${(e["DeltaAmount"] >= 0 ? "+" : "") + getShortNumber(e["DeltaAmount"] / 100)}€</div>
                    <div class="value">${getShortNumber((e["Price2"]/e["Price1"] - 1.0)*100)}%</div>
                </a>`
        })

        that.innerHTML = `<div class="inner">
                        <div class="titlebar">
                            <nav class="timeframeSelector">
                                <button class="tf" data-tf="30">30m</button>
                                <button class="tf" data-tf="60">60m</button>
                                <button class="tf" data-tf="360">6h</button>
                                <button class="tf" data-tf="1440">24h</button>                                                     
                            </nav>
                            <h2>${getTranslatedStr("stocks.starred_list.title")}</h2>
                            <div></div>
                        </div>
                        <div class="contentTable grid-1-name-3">
                            ${html}
                        </div>
                    </div>
                `
        that.querySelectorAll("button.tf").forEach(b => {
            if (Number(b.dataset.tf) === Number(that.timeframe)) {
                b.classList.add("selected")
            }
            b.addEventListener("click", () => {
                that.changeTimeframe(b.dataset.tf, that)
            })
        })
    }
}



customElements.define('stock-list-starred-delta', stocklistStarredDelta);
