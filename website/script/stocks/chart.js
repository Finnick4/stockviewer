class stockChart extends HTMLElement {
    connectedCallback() {
        this.stockid = this.getAttribute("data-stock-id")
        this.innerHTML = `
                        <div class="inner">
                            <h2>${this.stockid}</h2>
                            <nav class="timeframe-selector"></nav>
                            <svg class="chart" viewbox="0 0 100 100" width="10rem">
                                <path d="M0 0 L1 1 L10 1 L40 50 L80 10" ></path>
                            </svg>
                        </div>
                        `
    }
}

customElements.define('stock-chart', stockChart);
