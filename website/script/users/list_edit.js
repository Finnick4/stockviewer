class userListEdit extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <h2>${getTranslatedStr("users.list.title_edit")}</h2>
                <p>${getTranslatedStr("users.list.loading")}</p>
            </div>`

        this.classList.add("userDisplayElement")
        this.update()
    }
    update() {
        fetch(`/api/users/`).then(r => r.json()).then(resp =>{
            const statusStr = status => {
                switch (Number(status)) {
                    case 1: return getTranslatedStr("users.status.active")
                    case 2: return getTranslatedStr("users.status.to_be_activated")
                    case 3: return getTranslatedStr("users.status.disabled")
                    default: return getTranslatedStr("users.status.invalid_status")
                }
            }
            let html = ""
            resp["Data"].forEach(user => {
                html += `
                <div class="containing" data-user-id="${user["ID"]}">
                    <div class="shorthand">${sanitiseText(user["Tag"])}</div>
                    <div class="name display">${sanitiseText(user["Name"])}</div>
                    <button is="edit-user-permissions-button" data-user-id="${user["ID"]}"></button>
                    <div class="value status">${statusStr(user["Status"])}</div>
                </div>`
            })

            this.innerHTML = `<div class="inner">
                        <div class="titlebar">
                            <div></div>
                            <h2>${getTranslatedStr("users.list.title_edit")}</h2>
                            <div></div>
                        </div>
                        <div class="contentTable grid-1-name-2">
                            ${html}
                        </div>
                    </div>
                `
        })
    }
}



customElements.define('user-list-edit', userListEdit);
