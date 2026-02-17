function buildAdminUsersPage() {
    const main = `
        <h1>Admin Panel</h1> <p>Modify users.</p>`;
    const side = `
            <a is="a-button" href="/admin/users" class="sidebarElement selected btn">Users</a>
            <a is="a-button" href="/admin/stocks" class="sidebarElement btn">Stocks</a>`

    setMainBodyHTMLAndSidebar(main, side);
}