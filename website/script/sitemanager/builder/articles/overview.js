function buildArticlesOverviewPage() {
    const main = `<recent-articles></recent-articles>`;

    setMainBodyHTML(main);
    const nav = document.querySelector("header-bar nav.move")
    nav.querySelector("a.selected")?.classList.remove("selected")
    nav.querySelector(`a[href="/articles"]`)?.classList.add("selected")
}