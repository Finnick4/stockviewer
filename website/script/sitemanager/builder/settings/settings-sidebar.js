function getSettingsSidebar(selectedLocation) {
    let html = `<nav class="linklist">`

    const paths = ["name", "preferences", "sessions", "other"]
    paths.forEach(path => html += `<a is="a-button" href="/settings/${path}" class="sidebarElement btn ${path === selectedLocation ? "selected" : ""}">${getTranslatedStr(`settings.settings_pages.${path}`)}</a>`)

    return html + `</nav>`
}