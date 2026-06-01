class editUserButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.userID = this.dataset.userId

        this.classList.add("edit")

        this.title = getTranslatedStr("users.edit.button_alt_text")
        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="${getTranslatedStr("users.edit.button_alt_text")}" draggable="false">`

        this.onclick = () => showEditUserModal(this.userID)
    }
}

customElements.define('edit-user-button', editUserButtonElement, {extends: "button"});


function showEditUserModal(userID) {
    const permName = userInfo.checkPerm("canEditUserName")
    const permPW = userInfo.checkPerm("canEditUserPassword")

    const permDelete = userInfo.checkPerm("canDeleteUsers")
    const dangerZoneVisible = permDelete

    let html = `<h2>${getTranslatedStr("users.edit.title_other", {name: getTranslatedStr("users.edit.loading_name")})} <div class="tag value">${getTranslatedStr("users.edit.loading_tag")}</div></h2>
                        ${permName ? `
                        <div class="pair">
                            <p>${getTranslatedStr("users.name")}</p>
                            <input class="displayname" type="text" placeholder="${getTranslatedStr("users.edit.placeholder_name")}">
                        </div>
                        <div class="pair">
                            <p>${getTranslatedStr("users.tag")}</p>
                            <input class="tag" type="text" placeholder="${getTranslatedStr("users.edit.placeholder_tag")}">
                        </div>` : ""}
                        ${permPW ? `<div class="pair">
                          <p>${getTranslatedStr("users.edit.new_pw")}</p>
                          <input type="password" class="pw">
                        </div>` : ""}
                        ${permName || permPW ? `
                        <div class="pair submit">
                            <div class="info"></div>
                            <button class="submit">${getTranslatedStr("users.edit.submit")}</button>
                        </div>` : ""}
                        ${dangerZoneVisible ? `
                        <div class="dangerZone">
                            <h3 class="warning">${getTranslatedStr("users.edit.danger.title")}</h3>
                            <p class="warning">${getTranslatedStr("users.edit.danger.subtitle")}</p>
                            ${permDelete ? `
                                <div class="pair">
                                    <p>${getTranslatedStr("users.edit.danger.delete")}</p>
                                    <button class="delete">${getTranslatedStr("users.edit.danger.delete_button")}</button>
                                </div>
                            ` : ""}
                        </div>
                        ` : ""}
                      `
    const id = createModal(html)
    const modal = document.getElementById(id)

    const infotxt = modal.querySelector(".info")

    const name = modal.querySelector(`input.displayname`)
    const tag = modal.querySelector(`input.tag`)
    const pw = modal.querySelector(`input.pw`)

    if (permDelete) {
        const deleteBtn = modal.querySelector("button.delete")
        deleteBtn.addEventListener("click", () => showAuthenticatePromptModal(password => new Promise((resolve, reject) => {
            fetch(`/api/users/${userID}`, {
                method: "DELETE",
                body: JSON.stringify({
                    password: password
                })
            }).then(r => {
                if (r.ok) {
                    closeModal(id)
                    resolve()
                } else {
                    reject()
                }
            })
        }), "user_delete"))
    }

    const setErr = createSetErr(infotxt)

    const validate = () => {
        if (permName && !verifyUserName(name.value, setErr)) {
            return false
        }

        if (permName && !verifyUserTag(tag.value, setErr)) {
            return false
        }

        if (permPW && pw.value !== "" && !plausiblePassword(pw.value)) {
            setErr(getTranslatedStr("users.edit.err_pw_implausible"))
            return false
        }

        infotxt.innerHTML = getTranslatedStr("users.edit.values_okay")
        infotxt.classList.add("positive")
        infotxt.classList.remove("negative")
        return true
    }
    let userName = "", userTag = ""

    loadUserData(userID, user => {
        if (user === undefined) {
            modal.querySelector(".content").innerHTML = `<h2>${getTranslatedStr("users.edit.err_invalid_user_header")}</h2><p>${getTranslatedStr("users.edit.err_invalid_user_hint")}</p>`
            return
        }
        modal.querySelector("h2").innerHTML = `${getTranslatedStr("users.edit.title_other", {name: user.Name})} <div class="tag value">${user.Tag}</div>`
        name.value = user.Name
        userName = user.Name
        tag.value = user.Tag
        userTag = user.Tag
        validate()
    })


    modal.querySelectorAll(`.pair input`).forEach(elem => {
        elem.addEventListener("input", () => validate())
    })

    modal.querySelector(`button.submit`)?.addEventListener("click", () => {
        if (validate()) {
            fetch(`/api/users/${userID}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: permName && name.value !== userName ? name.value : "",
                    tag: permName && tag.value !== userTag ? tag.value : "",
                    password: permPW && pw.value !== "" ? pw.value : ""
                })
            }).then(r => {
                if (r.ok) {
                    document.querySelectorAll(`.userDisplayElement`).forEach(e => e.update())
                    closeModal(id)
                } else {
                    if (r.status >= 400 || r.status < 500) {
                        if (r.status === 400) {
                            r.json().then(resp => {
                                if (resp.Message === "Tag already taken!") {
                                    setErr(getTranslatedStr("users.edit.err_tag_taken"))
                                } else {
                                    setErr(getTranslatedStr("network.issues.generic_request", {code: r.status}))
                                }
                            })
                        } else {
                            setErr(getTranslatedStr("network.issues.generic_request", {code: r.status}))
                        }
                    } else {
                        setErr(getTranslatedStr("network.issues.generic_server", {code: r.status}))
                    }
                }
            });
        }
    })
    validate()
}