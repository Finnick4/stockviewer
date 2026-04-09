function buildSettingsSessionsPage() {
    const main = `
        <h1>${getTranslatedStr("settings.sessions.title")}</h1>
        <div class="actions">
            <div class="pair">
                <p>${getTranslatedStr("settings.sessions.change_pw")}</p>
                <button class="passwordChangeBtn" onclick="showChangePasswordModal()">${getTranslatedStr("settings.sessions.change_pw_button_label")}</button>
            </div>
        </div>`
            
    setMainBodyHTMLAndSidebar(main, getSettingsSidebar("sessions"))
}