function buildStockGroupsOverviewPage() {
    const main = `<stockgroups-list></stockgroups-list>`;

    setMainBodyHTML(main);
    document.title = getTranslatedStr("miscellaneous.stock_groups_title")
    document.querySelector("header-bar nav.move").querySelector(`a[href="/groups"]`)?.classList.add("selected")
}