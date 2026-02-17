function buildAdminRootPage() {
    const main = `
        <h1>Admin Panel</h1> <p>Click on the sidebar to get to a specific page.</p>`;
    const side = `
            <a is="a-button" href="/admin/users" class="sidebarElement btn">Users</a>
            <a is="a-button" href="/admin/stocks" class="sidebarElement btn">Stocks</a>`
    setMainBodyHTMLAndSidebar(main, side);
}