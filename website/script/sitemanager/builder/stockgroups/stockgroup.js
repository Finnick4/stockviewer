function buildIndividualStockGroupPage(id) {
    if (isNaN(id) || id <= 0) {
        window.history.pushState(null, null, `${window.location.origin}/groups`);
        router("/groups");
    }

    const main = `
                        <stockgroups-members-list data-stock-group-id="${id}"></stockgroups-members-list>
                        `;
    setMainBodyHTML(main, "stockGroupOverviewPage");
}