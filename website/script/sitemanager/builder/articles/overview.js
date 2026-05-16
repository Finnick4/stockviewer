function buildArticlesOverviewPage() {
    const main = `<recent-articles></recent-articles>`;

    setMainBodyHTML(main);
    document.querySelector("header-bar nav.move").querySelector(`a[href="/articles"]`)?.classList.add("selected")
}