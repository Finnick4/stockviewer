function buildAdminStocksPage() {
    const main = `
        <stock-list-edit></stock-list-edit>`

    setMainBodyHTMLAndSidebar(main, getAdminSidebar("stocks"))
}