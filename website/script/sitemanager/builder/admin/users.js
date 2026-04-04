function buildAdminUsersPage() {
    const main = `<user-list-edit></user-list-edit>`;
    const side = `
            <nav class="linklist">
            <a is="a-button" href="/admin/users" class="sidebarElement selected btn">Users</a>
            <a is="a-button" href="/admin/stocks" class="sidebarElement btn">Stocks</a>
            </nav>`

    setMainBodyHTMLAndSidebar(main, side);
}