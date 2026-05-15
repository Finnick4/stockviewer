function buildStockGroupsOverviewPage() {
    const main = `<stockgroups-list></stockgroups-list>`;

    setMainBodyHTML(main);
    const nav = document.querySelector("header-bar nav.move")
    nav.querySelector("a.selected")?.classList.remove("selected")
    nav.querySelector(`a[href="/groups"]`)?.classList.add("selected")
}