function buildIndividualStockGroupPage(id) {
    if (isNaN(id) || id <= 0) {
        window.history.pushState(null, null, `${window.location.origin}/groups`);
        router("/groups");
    }

    const main = `
                        <h2 class="tmp">Individual stock group page</h2>
                        <stockgroups-member-pie-chart data-stock-group-id="${id}"></stockgroups-member-pie-chart>
                        <stockgroups-members-list data-stock-group-id="${id}"></stockgroups-members-list>
                        `;
    setMainBodyHTML(main, "stockGroupOverviewPage");
}