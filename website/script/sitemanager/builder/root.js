function buildRootPage() {
    document.body.innerHTML = `
    <header-bar></header-bar>
    <div class="main">
        <stock-chart data-stock-id="1"></stock-chart>
        <stocklist-all></stocklist-all>
    </div>`
}