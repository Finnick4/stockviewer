class stockGroupChart extends HTMLElement {
    connectedCallback() {
        this.groupid = this.dataset.stockGroupId
        this.timeframe = 30
        this.width = 80
        this.height = 40
        this.xPadding = 15
        this.yPadding = 5
        this.innerHTML = `
                        <div class="inner">
                            <div class="titlebar">
                            <nav class="timeframeSelector">
                                <button class="tf selected" data-tf="30">30m</button>
                                <button class="tf" data-tf="60">60m</button>
                                <button class="tf" data-tf="360">6h</button>
                                <button class="tf" data-tf="1440">24h</button>
                            </nav>
                            <h2>${getTranslatedStr("stockgroups.chart.stock_history")}</h2>
                            <div></div>
                            </div>
                            <svg class="chart" viewbox="5 0 90 47">
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
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/${this.groupid}/sse?Timeframe=${this.timeframe}`, addThisToFunctionCall(this.redrawGraph, this))
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
        that.closeSubscription = subscribeToAPI(`/api/stockgroups/${that.groupid}/sse?Timeframe=${that.timeframe}`, addThisToFunctionCall(that.redrawGraph, that))
    }

    redrawGraph(data, that) {
        const totalMin = getMinimum(data.map(hstry => getMinimum(hstry.History.map(elem => elem.Price))))
        const totalMax = getMaximum(data.map(hstry => getMaximum(hstry.History.map(elem => elem.Price))))
        const maxCount = getMaximum(data.map(hstry => hstry.History.length))

        const vunit = totalMax - totalMin !== 0 ? (totalMax - totalMin) / that.height : 1     // Vertical Unit
        const hunit = that.width / maxCount    // Horizontal Unit
        const getHeight = x => (x - totalMin) / vunit

        that.querySelectorAll("svg path").forEach(e => e.remove())

        const svg = that.querySelector("svg")

        const pieChart = document.querySelector(`main stockgroups-member-pie-chart[data-stock-group-id="${that.groupid}"]`)
        let stockColorMap = new Map()
        if (pieChart !== null) {
            stockColorMap = pieChart.stockColorMap
        }

        data.forEach(stockHistory => {
            const stockid = stockHistory.StockID
            const prices = stockHistory.History.map(elem => elem["Price"]).reverse()
            const startOffset = maxCount - prices.length

            let path = ""


            prices.forEach((price, i) => {
                const x = ((i + startOffset) * hunit) + that.xPadding
                const y = (that.height - getHeight(price)) + that.yPadding
                path += `L${x} ${y} `
            })
            if (path !== "") {
                path = path.replace('L', 'M')
            }
            const classes = prices[0] < prices[prices.length - 1] ? "positive" : "negative"
            const color = stockColorMap.has(stockid) ? stockColorMap.get(stockid) : ""
            const pathElemOuter = `<path class="${classes}" d="${path}" data-stock-id="${stockid}" ${color === "" ? "" : `style="stroke: ${color}"`}></path>`
            svg.innerHTML += pathElemOuter
        })

        const quater = (totalMax - totalMin) / 4

        const maxTxt = document.querySelector(`stock-group-chart[data-stock-group-id="${that.groupid}"] svg text.price.max`)
        const qmaxTxt = document.querySelector(`stock-group-chart[data-stock-group-id="${that.groupid}"] svg text.price.quatermax`)
        const middleTxt = document.querySelector(`stock-group-chart[data-stock-group-id="${that.groupid}"] svg text.price.middle`)
        const qminTxt = document.querySelector(`stock-group-chart[data-stock-group-id="${that.groupid}"] svg text.price.quatermin`)
        const minTxt = document.querySelector(`stock-group-chart[data-stock-group-id="${that.groupid}"] svg text.price.min`)

        maxTxt.innerHTML = getShortNumber(totalMax / 100)
        qmaxTxt.innerHTML = getShortNumber((totalMin + 3*quater) / 100)
        middleTxt.innerHTML = getShortNumber((totalMin + 2*quater) / 100)
        qminTxt.innerHTML = getShortNumber((totalMin + quater) / 100)
        minTxt.innerHTML = getShortNumber(totalMin / 100)
    }
}

customElements.define('stock-group-chart', stockGroupChart);