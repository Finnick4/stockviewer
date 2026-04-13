function getAdminSidebar(selectedLocation) {
    let html = `<nav class="linklist">`

    const paths = ["stocks", "archived_stocks", "users"]
    paths.forEach(path => html += `<a is="a-button" href="/admin/${path}" class="sidebarElement btn ${path === selectedLocation ? "selected" : ""}">${getTranslatedStr(`admin_panel.panels.${path}`)}</a>`)

    return html + `</nav>`
}