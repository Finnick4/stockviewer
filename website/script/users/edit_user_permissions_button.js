class editUserPermissionsButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.userID = this.dataset.userId

        this.classList.add("edit")

        this.title = getTranslatedStr("users.permissions.edit.button_alt_text")
        this.innerHTML = `<img class="icon" src="/icons/key.svg" alt="${getTranslatedStr("users.permissions.edit.button_alt_text")}" draggable="false">`

        this.onclick = () => showModalEditPermissions(this.userID)
    }

}

customElements.define('edit-user-permissions-button', editUserPermissionsButtonElement, {extends: "button"});
