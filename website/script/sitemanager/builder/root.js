function buildRootPage() {
    const main = `
        <stockgroups-members-list class="starredStocksList" data-stock-group-id="-1" data-alt-title="Starred Stocks"></stockgroups-members-list>
        <stockgroups-starred-list></stockgroups-starred-list>
        <relevant-articles class="articleInbox"></relevant-articles>
        `;
    setMainBodyHTML(main, "homepage");
}