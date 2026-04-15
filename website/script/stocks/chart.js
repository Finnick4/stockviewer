class stockChart extends HTMLElement {
    connectedCallback() {
        this.stockid = this.getAttribute("data-stock-id")
        this.timeframe = 1
        this.width = 80
        this.height = 40
        this.xPadding = 15
        this.yPadding = 5
        this.innerHTML = `
                        <div class="inner">
                            <div class="titlebar">
                            <nav class="timeframeSelector">
                                <button class="tf selected" data-tf="1">30m</button>
                                <button class="tf" data-tf="2">60m</button>
                                <button class="tf" data-tf="3">6h</button>
                                <button class="tf" data-tf="4">24h</button>
                                <button class="tf" data-tf="-1">all</button>                                                     
                            </nav>
                            <h2>${getTranslatedStr("stocks.chart.stock_history")}</h2>
                            <div></div>
                            </div>
                            <svg class="chart" viewbox="5 0 90 47">
                                <path d="M10 25 L90 25" ></path>
                                <text class="price max" x="5" y="5" font-size="2">???</text>
                                <text class="price quatermax" x="5" y="15" font-size="2">???</text>
                                <text class="price middle" x="5" y="25" font-size="2">???</text>
                                <text class="price quatermin" x="5" y="35" font-size="2">???</text>
                                <text class="price min" x="5" y="45" font-size="2">???</text>
                                <line class="axis" x1="15" x2="15" y1="5" y2="46"></line>
                                <line class="axis" x1="15" x2="95" y1="46" y2="46"></line>
                            </svg>
                        </div>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stocks/${this.stockid}/sse/?Timeframe=${this.timeframe}`, addThisToFunctionCall(this.redrawGraph, this))
        this.querySelectorAll("button.tf").forEach(b => {
            b.addEventListener("click", () => {
                this.changeTimeframe(b.dataset.tf, this)
                const sel = this.querySelector("button.tf.selected")
                if (sel !== null) {
                    sel.classList.remove("selected")
                }
                b.className = "tf selected"
            })
        })
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    changeTimeframe(tf, that) {
        that.timeframe = tf
        that.closeSubscription()
        that.closeSubscription = subscribeToAPI(`/api/stocks/${that.stockid}/sse/?Timeframe=${that.timeframe}`, addThisToFunctionCall(that.redrawGraph, that))
    }

    redrawGraph(data, that) {
        const prices = data.map(elem => elem["Price"]).reverse()
        const min = getMinimum(prices)
        const max = getMaximum(prices)
        const vunit = max - min !== 0 ? (max - min) / that.height : 1     // Vertical Unit
        const hunit = that.width / prices.length    // Horizontal Unit
        const getHeight = x => (x - min) / vunit
        let path = ""
        let circlesHTML = ""

        prices.forEach((elem, i) => {
            const x = (i * hunit) + that.xPadding
            const y = (that.height - getHeight(elem)) + that.yPadding
            path += `L${x} ${y} `
            circlesHTML += `<circle r="2" cx="${x}" cy="${y}" fill="red" opacity="0"><title>${(elem / 100).toLocaleString()}€</title></circle>`
        })
        document.querySelector(`stock-chart[data-stock-id="${that.stockid}"] svg`).innerHTML += circlesHTML
        if (path !== "") {
            path = path.replace('L', 'M')
        }

        const pathElem = document.querySelector(`stock-chart[data-stock-id="${that.stockid}"] svg path`)
        pathElem.setAttribute("d", path)
        pathElem.classList.remove("positive")
        pathElem.classList.remove("negative")
        if (prices[0] < prices[prices.length - 1]) {
            pathElem.classList.add("positive")
        } else {
            pathElem.classList.add("negative")
        }
        const quater = (max - min) / 4

        const maxTxt = document.querySelector(`stock-chart[data-stock-id="${that.stockid}"] svg text.price.max`)
        const qmaxTxt = document.querySelector(`stock-chart[data-stock-id="${that.stockid}"] svg text.price.quatermax`)
        const middleTxt = document.querySelector(`stock-chart[data-stock-id="${that.stockid}"] svg text.price.middle`)
        const qminTxt = document.querySelector(`stock-chart[data-stock-id="${that.stockid}"] svg text.price.quatermin`)
        const minTxt = document.querySelector(`stock-chart[data-stock-id="${that.stockid}"] svg text.price.min`)

        maxTxt.innerHTML = getShortNumber(max)
        qmaxTxt.innerHTML = getShortNumber(min + 3*quater)
        middleTxt.innerHTML = getShortNumber(min + 2*quater)
        qminTxt.innerHTML = getShortNumber(min + quater)
        minTxt.innerHTML = getShortNumber(min)
    }
}

customElements.define('stock-chart', stockChart);


function getMinimum(arr) {
    let m = Infinity
    arr.forEach(x => m = x < m ? x : m)
    return m
}

function getMaximum(arr) {
    let m = -Infinity
    arr.forEach(x => m = x > m ? x : m)
    return m
}