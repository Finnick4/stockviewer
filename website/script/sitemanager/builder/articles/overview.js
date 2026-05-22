function buildArticlesOverviewPage() {
    const main = `<recent-articles></recent-articles>`;

    setMainBodyHTML(main);
    document.title = getTranslatedStr("miscellaneous.articles_title")
    document.querySelector("header-bar nav.move").querySelector(`a[href="/articles"]`)?.classList.add("selected")
}