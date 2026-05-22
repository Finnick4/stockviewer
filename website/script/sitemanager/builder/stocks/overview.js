function buildStocksOverviewPage() {
    const main = `<stock-list-delta></stock-list-delta>`;

    setMainBodyHTML(main);
    document.title = getTranslatedStr("miscellaneous.stocks_title")
    document.querySelector("header-bar nav.move").querySelector(`a[href="/stocks"]`)?.classList.add("selected")
}