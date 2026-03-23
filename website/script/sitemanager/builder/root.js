function buildRootPage() {
    const main = `<stock-chart data-stock-id="1"></stock-chart>
        <stock-list-delta></stock-list-delta>
        <stockgroups-members-list data-stock-group-id="-1" data-alt-title="Starred Stocks"></stockgroups-members-list>
        `;
    setMainBodyHTML(main, "homepage");
}