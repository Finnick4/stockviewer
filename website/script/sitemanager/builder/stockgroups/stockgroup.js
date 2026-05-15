function buildIndividualStockGroupPage(id) {
    if (isNaN(id) || Number(id) === 0 || Number(id) < -1) {
        window.history.pushState(null, null, `${window.location.origin}/groups`);
        router("/groups");
    }

    const main = `
                        <stock-group-header data-stock-group-id="${id}"></stock-group-header>
                        <stockgroups-member-pie-chart data-stock-group-id="${id}"></stockgroups-member-pie-chart>
                        <stockgroups-members-list data-stock-group-id="${id}"></stockgroups-members-list>
                        <stock-group-chart data-stock-group-id="${id}"></stock-group-chart>
                        <stock-group-description data-stock-group-id="${id}"></stock-group-description>
                        <stockgroup-influence-list data-stock-group-id="${id}"></stockgroup-influence-list>
`;
    setMainBodyHTML(main, "individualStockGroupPage");
}