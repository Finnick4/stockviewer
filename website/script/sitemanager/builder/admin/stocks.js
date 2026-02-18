function buildAdminStocksPage() {
    const main = `
        <stock-list-edit></stock-list-edit>`;
    const side = `<nav class="linklist">
            <a is="a-button" href="/admin/users" class="sidebarElement btn">Users</a>
            <a is="a-button" href="/admin/stocks" class="sidebarElement selected btn">Stocks</a> 
            </nav>`

    setMainBodyHTMLAndSidebar(main, side);
}