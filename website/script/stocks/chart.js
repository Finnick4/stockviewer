class stockChart extends HTMLElement {
    connectedCallback() {
        this.stockid = this.getAttribute("data-stock-id")
        this.timeframe = 1
        this.innerHTML = `
                        <div class="inner">
                            <h2>${this.stockid}</h2>
                            <nav class="timeframe-selector"></nav>
                            <svg class="chart" viewbox="0 0 100 50">
                                <path d="M10 25 L90 25" ></path>
                                <line class="axis" x1="10" x2="10" y1="5" y2="46"></line>
                                <line class="axis" x1="10" x2="90" y1="46" y2="46"></line>
                            </svg>
                        </div>
                        `
        fetch(`${window.location.origin}/api/stocks/?Timeframe=${this.timeframe}&Id=${this.stockid}`).then(resp => resp.json()).then(obj => {
            this.redrawGraph(obj["Data"].map(elem => elem["Price"]).reverse())
        })

    }
    redrawGraph(prices) {
        const width = 80
        const height = 40
        const xPadding = 10
        const yPadding = 5
        const min = getMinimum(prices)
        const max = getMaximum(prices)
        const vunit = (max - min) / height
        const hunit = width / prices.length
        const getHeight = x => (x - min) / vunit
        let path = ""

        prices.forEach((elem, i) => {
            path += `L${(i * hunit) + xPadding} ${(height - getHeight(elem)) + yPadding} `
        })

        if (path !== "") {
            path = path.replace('L', 'M')
        }

        const pathElem = document.querySelector(`stock-chart[data-stock-id="${this.stockid}"] svg path`)
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