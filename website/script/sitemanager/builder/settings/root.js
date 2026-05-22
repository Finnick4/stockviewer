function buildSettingsRootPage() {
    const main = `
        <h1>${getTranslatedStr("settings.generic_title")}</h1> <p>${getTranslatedStr("settings.notice_sidebar")}</p>`
            
    setMainBodyHTMLAndSidebar(main, getSettingsSidebar())
    document.title = getTranslatedStr("miscellaneous.settings_title")
}