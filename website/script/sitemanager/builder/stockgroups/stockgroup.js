function buildIndividualStockGroupPage(id) {
    if (isNaN(id) || id <= 0) {
        window.history.pushState(null, null, `${window.location.origin}/groups`);
        router("/groups");
    }

    const main = `
                        <stock-group-header data-stock-group-id="${id}"></stock-group-header>
                        <stockgroups-member-pie-chart data-stock-group-id="${id}"></stockgroups-member-pie-chart>
                        <stockgroups-members-list data-stock-group-id="${id}"></stockgroups-members-list>
                        `;
    setMainBodyHTML(main, "stockGroupOverviewPage");
}