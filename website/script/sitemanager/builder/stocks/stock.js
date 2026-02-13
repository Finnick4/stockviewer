function buildIndividualStockPage(id) {
    if (isNaN(id) || id <= 0) {
        window.history.pushState(null, null, `${window.location.origin}/stocks`);
        router("/stocks");
    }

    const main = `
                        <stock-header data-stock-id="${id}"></stock-header>
                        <stock-chart data-stock-id="${id}"></stock-chart>
                        <related-stocks data-stock-id="${id}"></related-stocks>
                        `;
    setMainBodyHTML(main);
}