class stockChart extends HTMLElement {
    connectedCallback() {
        this.stockid = this.getAttribute("data-stock-id")
        this.innerHTML = `
                        <div class="inner">
                            <h2>${this.stockid}</h2>
                            <nav class="timeframe-selector"></nav>
                            <svg class="chart" viewbox="0 0 100 50">
                                <path d="M10 25 L20 10 L30 30 L40 40 L50 20" ></path>
                                <line class="axis" x1="10" x2="10" y1="5" y2="45"></line>
                                <line class="axis" x1="10" x2="90" y1="45" y2="45"></line>
                            </svg>
                        </div>
                        `
    }
}

customElements.define('stock-chart', stockChart);
