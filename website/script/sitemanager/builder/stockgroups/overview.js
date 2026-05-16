function buildStockGroupsOverviewPage() {
    const main = `<stockgroups-list></stockgroups-list>`;

    setMainBodyHTML(main);
    document.querySelector("header-bar nav.move").querySelector(`a[href="/groups"]`)?.classList.add("selected")
}