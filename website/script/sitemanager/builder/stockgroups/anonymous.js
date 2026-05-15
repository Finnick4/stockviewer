function buildAnonymousStockGroupPage(members) {
    if (!Array.isArray(members) || members.length === 0) {
        window.history.pushState(null, null, `${window.location.origin}/groups`);
        router("/groups");
        return;
    }

    for (const id of members) {
        if (isNaN(id) || Number(id) === 0 || Number(id) < -1) {
            window.history.pushState(null, null, `${window.location.origin}/groups`);
            router("/groups");
            return
        }
    }
    anonymousStockGroupMembers = members

    const main = `
                        <stock-group-header data-stock-group-id="0"></stock-group-header>
                        <stockgroups-member-pie-chart data-stock-group-id="0"></stockgroups-member-pie-chart>
                        <stockgroups-members-list data-stock-group-id="0"></stockgroups-members-list>
                        <stock-group-chart data-stock-group-id="0"></stock-group-chart>`;
    setMainBodyHTML(main, "individualStockGroupPage");
}