function buildRootPage() {
    const main = `<stock-chart data-stock-id="1"></stock-chart>
        <stock-list-delta></stock-list-delta>`;
    setMainBodyHTML(main);
}