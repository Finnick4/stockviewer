function buildIndividualStockPage(id) {
    if (isNaN(id)) {
        window.history.pushState(null, null, `${window.location.origin}/stocks`);
        router("/stocks");
    }

    const main = `<stock-chart data-stock-id="${id}"></stock-chart>
                        <related-stocks data-stock-id="${id}"></related-stocks>
                        `;
    setMainBodyHTML(main);
}