function buildAdminStocksPage() {
    const main = `
        <h1>Admin Panel</h1> <p>Modify stocks.</p>`;
    const side = `
            <a is="a-button" href="/admin/users" class="sidebarElement btn">Users</a>
            <a is="a-button" href="/admin/stocks" class="sidebarElement selected btn">Stocks</a>`

    setMainBodyHTMLAndSidebar(main, side);
}