
class userManagerElement extends HTMLElement {
    connectedCallback() {
        this.dropdownid = createDropdown(`
        <a is="a_link" class="btn" href="/user-settings">${getTranslatedStr("user_manager.dashboard_account")}</a>
        <a is="a_link" class="btn" href="/admin">${getTranslatedStr("user_manager.dashboard_admin")}</a>
        <button onclick="logout()">${getTranslatedStr("user_manager.logout")}</button>
        `)
        this.innerHTML = `
        <button popovertarget="${this.dropdownid}" class="usermanager" style="anchor-name: --anchor-${this.dropdownid};">
            <div class="name">loading...</div>
            <img class="icon" src="/icons/user.svg" alt="user icon" draggable="false">
        </button>`
        userInformation.writeDisplayName(name => {
            this.querySelector("div.name").innerHTML = sanitiseText(name)
        })
    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}


customElements.define('user-manager', userManagerElement);

