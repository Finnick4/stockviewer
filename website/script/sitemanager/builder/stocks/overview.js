function buildStocksOverviewPage() {
    const main = `<stock-list-delta></stock-list-delta>`;

    setMainBodyHTML(main);
    document.querySelector("header-bar nav.move").querySelector(`a[href="/stocks"]`)?.classList.add("selected")
}