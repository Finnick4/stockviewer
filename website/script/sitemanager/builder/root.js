function buildRootPage() {
    const main = `
        <stock-list-starred-delta class="starredStocksList"></stock-list-starred-delta>
        <stockgroups-starred-list></stockgroups-starred-list>
        <relevant-articles class="articleInbox"></relevant-articles>
        `;
    setMainBodyHTML(main, "homepage");
}