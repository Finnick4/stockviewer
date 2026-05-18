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
                            <timeframe-selector></timeframe-selector>
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
        if (Number(this.groupid) === 0) {
            this.closeSubscription = subscribeToAPI(`/api/stockgroups/anonymous/sse?members=${anonymousStockGroupMembers}&Timeframe=${this.timeframe}`, addThisToFunctionCall(this.redrawGraph, this))
        } else {
            this.closeSubscription = subscribeToAPI(`/api/stockgroups/${this.groupid}/sse?Timeframe=${this.timeframe}`, addThisToFunctionCall(this.redrawGraph, this))
        }
        const tfSelector = this.querySelector("timeframe-selector")
        tfSelector.onEdit = () => {
            this.changeTimeframe(tfSelector.value, this)
        }

        this.classList.add("stockGroupMembersChartPathsHighlightable")
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    changeTimeframe(tf, that) {
        that.timeframe = tf
        that.closeSubscription()
        if (Number(this.groupid) === 0) {
            this.closeSubscription = subscribeToAPI(`/api/stockgroups/anonymous/sse?members=${anonymousStockGroupMembers}&Timeframe=${that.timeframe}`, addThisToFunctionCall(that.redrawGraph, that))
        } else {
            this.closeSubscription = subscribeToAPI(`/api/stockgroups/${that.groupid}/sse?Timeframe=${this.timeframe}`, addThisToFunctionCall(that.redrawGraph, that))
        }
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
        console.log(pieChart)
        let stockColorMap = new Map()

        const drawGraph = () => {
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
            qmaxTxt.innerHTML = getShortNumber((totalMin + 3 * quater) / 100)
            middleTxt.innerHTML = getShortNumber((totalMin + 2 * quater) / 100)
            qminTxt.innerHTML = getShortNumber((totalMin + quater) / 100)
            minTxt.innerHTML = getShortNumber(totalMin / 100)
        }

        if (pieChart !== null) {
            if (pieChart.stockColorMap.size === 0) {
                pieChart.onUpdate = makeOneTimeFunction(() => {
                    stockColorMap = pieChart.stockColorMap
                    drawGraph()
                })
            } else {
                stockColorMap = pieChart.stockColorMap
                drawGraph()
            }
        } else {
            drawGraph()
        }


        console.log(stockColorMap)
    }
}

customElements.define('stock-group-chart', stockGroupChart);