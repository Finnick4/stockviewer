function buildSettingsStarredStockGroupsPage() {
    const main = `
        <h1>${getTranslatedStr("settings.starred.title_stock_groups")}</h1>
        <stockgroups-starred-list></stockgroups-starred-list>`
            
    setMainBodyHTMLAndSidebar(main, getSettingsSidebar("starred_stock_groups"))
    document.title = getTranslatedStr("miscellaneous.settings_starred_stock_groups_title")
}