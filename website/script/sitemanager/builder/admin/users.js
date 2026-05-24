function buildAdminUsersPage() {
    const main = `<user-list-edit></user-list-edit>`

    setMainBodyHTMLAndSidebar(main, getAdminSidebar("users"), "settingsPage")
}