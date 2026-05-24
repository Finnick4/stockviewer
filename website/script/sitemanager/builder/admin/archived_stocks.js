function buildArchivedStocksPage() {
    const main = `
        <stock-list-archived></stock-list-archived>`

    setMainBodyHTMLAndSidebar(main, getAdminSidebar("archived_stocks"), "settingsPage")
}