class stocklistDelta extends HTMLElement {
    connectedCallback() {
        this.timeframe = 1
        this.innerHTML = `<div class="inner">
                <nav><h2>All stocks</h2></nav>
                <p>Loading stock data...</p>
            </div>`
        this.closeSubscription = subscribeToAPI(`/api/stocks/sse/?Timeframe=${this.timeframe}`, addThisToFunctionCall(this.updateData, this))
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    changeTimeframe(tf, that) {
        console.log(tf)
        that.timeframe = tf
        that.closeSubscription()
        that.closeSubscription = subscribeToAPI(`/api/stocks/sse/?Timeframe=${that.timeframe}`, addThisToFunctionCall(that.updateData, that))
    }

    updateData(data, that) {
        let html = ""
        data.forEach(e => {
            const shortPrice = getShortPrice(e["Price2"]/100)
            html += `<li class="stockOverview"  data-stock-id="${e["ID"]}">
                            <a class="containing" is="a-button" href="/stocks/${e["ID"]}">
                                <div class="stockName">${sanitiseText(e["Name"])}</div>
                                <div class="${e["DeltaAmount"] >= 0 ? "positive" : "negative"}">
                                    <div class="change">${shortPrice}</div>
                                    <div class="change">${(e["DeltaAmount"] >= 0 ? "+" : "") + getShortPrice(e["DeltaAmount"] / 100)}€</div>
                                    <div class="change">${getShortPrice((e["Price2"]/e["Price1"] - 1.0)*100)}%</div>
                                </div>
                            </a>
                        </li>`
        })

        that.innerHTML = `<ul class="inner">
                        <div class="titlebar"><div></div><h2>All stocks</h2>
                        <nav class="timeframeSelector">
                            <button class="tf" data-tf="1">30m</button>
                            <button class="tf" data-tf="2">60m</button>
                            <button class="tf" data-tf="3">6h</button>
                            <button class="tf" data-tf="4">24h</button>                                                     
                        </nav></div>
                        ${html}
                    </ul>
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



customElements.define('stock-list-delta', stocklistDelta);
