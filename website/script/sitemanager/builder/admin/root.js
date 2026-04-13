function buildAdminRootPage() {
    const main = `
        <h1>${getTranslatedStr("admin_panel.generic_title")}</h1> <p>${getTranslatedStr("admin_panel.notice_sidebar")}</p>`;
    setMainBodyHTMLAndSidebar(main, getAdminSidebar());
}