function buildSettingsStarredStocksPage() {
    const main = `
        <h1>${getTranslatedStr("settings.starred.title_stocks")}</h1>
        <stock-list-starred-delta></stock-list-starred-delta>`
            
    setMainBodyHTMLAndSidebar(main, getSettingsSidebar("starred_stocks"))
    document.title = getTranslatedStr("miscellaneous.settings_starred_stocks_title")
}