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
                            <h2>Stock History</h2>
                            <nav class="timeframe-selector"></nav>
                            <svg class="chart" viewbox="0 0 100 50">
                                <path d="M10 25 L90 25" ></path>
                                <line class="axis" x1="10" x2="10" y1="5" y2="46"></line>
                                <line class="axis" x1="10" x2="90" y1="46" y2="46"></line>
                            </svg>
                        </div>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stocks/sse/?Timeframe=${this.timeframe}&Id=${this.stockid}`, addThisToFunctionCall(this.redrawGraph, this))
    }
    disconnectedCallback() {
        this.closeSubscription()
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