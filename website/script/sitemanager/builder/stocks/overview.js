function buildStocksOverviewPage() {
    const main = `<stock-list-delta></stock-list-delta>`;

    setMainBodyHTML(main);
    const nav = document.querySelector("header-bar nav.move")
    nav.querySelector("a.selected")?.classList.remove("selected")
    nav.querySelector(`a[href="/stocks"]`)?.classList.add("selected")
}