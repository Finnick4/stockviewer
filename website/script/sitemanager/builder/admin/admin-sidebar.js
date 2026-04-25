function getAdminSidebar(selectedLocation) {
    let html = `<nav class="linklist">`

    const paths = []

    if (userInfo.hasAnyEditStockPermissions) paths.push("stocks")
    if (userInfo.checkPerm("isStockArchivist")) paths.push("archived_stocks")
    if (userInfo.canViewAdminPanelUsersTab) paths.push("users")

    paths.forEach(path => html += `<a is="a-button" href="/admin/${path}" class="sidebarElement btn ${path === selectedLocation ? "selected" : ""}">${getTranslatedStr(`admin_panel.panels.${path}`)}</a>`)

    return html + `</nav>`
}