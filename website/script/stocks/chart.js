class stockChart extends HTMLElement {
    connectedCallback() {
        this.stockid = this.getAttribute("data-stock-id")
        this.timeframe = 1
        this.width = 80
        this.height = 40
        this.xPadding = 10
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
                            <h2>Stock History</h2>
                            <div></div>
                            </div>
                            <svg class="chart" viewbox="5 0 90 47">
                                <path d="M10 25 L90 25" ></path>
                                <line class="axis" x1="10" x2="10" y1="5" y2="46"></line>
                                <line class="axis" x1="10" x2="90" y1="46" y2="46"></line>
                            </svg>
                        </div>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stocks/sse/?Timeframe=${this.timeframe}&Id=${this.stockid}`, addThisToFunctionCall(this.redrawGraph, this))
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
        that.closeSubscription = subscribeToAPI(`/api/stocks/sse/?Timeframe=${that.timeframe}&Id=${that.stockid}`, addThisToFunctionCall(that.redrawGraph, that))
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