function buildAdminUsersPage() {
    const main = `
        <h1>Admin Panel</h1> <p>Modify users.</p>`;
    const side = `
            <nav class="linklist">
            <a is="a-button" href="/admin/users" class="sidebarElement selected btn">Users</a>
            <a is="a-button" href="/admin/stocks" class="sidebarElement btn">Stocks</a>
            </nav>`

    setMainBodyHTMLAndSidebar(main, side);
}