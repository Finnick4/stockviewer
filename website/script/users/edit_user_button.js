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
    fetch(`/api/users`).then(r => r.json()).then(resp => {
        const user = (resp.Data.filter(user => user.ID === userID))[0]
        console.log(user)
        const userName = sanitiseText(user.Name)
        const userTag = sanitiseText(user.Tag)

        let html = `<h2>${getTranslatedStr("users.edit.title_other", {name: userName})} <div class="tag value">${userTag}</div></h2>
                        <div class="pair">
                            <p>${getTranslatedStr("users.name")}</p>
                            <input class="displayname" type="text" placeholder="${getTranslatedStr("users.edit.placeholder_name")}" value="${userName}">
                        </div>
                        <div class="pair">
                            <p>${getTranslatedStr("users.tag")}</p>
                            <input class="tag" type="text" placeholder="${getTranslatedStr("users.edit.placeholder_tag")}" value="${userTag}">
                        </div>
                        <div class="pair">
                          <p>${getTranslatedStr("users.edit.new_pw")}</p>
                          <input type="password" class="pw">            
                        </div>
                        <div class="pair submit">
                            <div class="info"></div>
                            <button class="submit">${getTranslatedStr("stocks.modify.submit")}</button>
                        </div>
                      `
        const id = createModal(html)
        const modal = document.getElementById(id)

        const infotxt = modal.querySelector(".info")
        const name = modal.querySelector(`input.displayname`)
        const tag = modal.querySelector(`input.tag`)
        const pw = modal.querySelector(`input.pw`)

        let permName = false, permPW = false

        if (!userInfo.checkPerm("canEditUserName")) {
            name.readOnly = true
            tag.readOnly = true
        } else {
            permName = true
        }

        if (!userInfo.checkPerm("canEditUserPassword")) {
            pw.readOnly = true
        } else {
            permPW = true
        }

        const setErr = createSetErr(infotxt)

        const validate = () => {
            if (!verifyUserName(name.value, setErr)) {
                return false
            }

            if (!verifyUserTag(tag.value, setErr)) {
                return false
            }

            if (!plausiblePassword(pw.value)) {
                setErr(getTranslatedStr("users.edit.err_pw_implausible"))
                return false
            }

            infotxt.innerHTML = getTranslatedStr("users.edit.values_okay")
            infotxt.classList.add("positive")
            infotxt.classList.remove("negative")
            return true
        }

        modal.querySelectorAll(`.pair input`).forEach(elem => {
            elem.addEventListener("input", () => validate())
        })

        modal.querySelector(`button.submit`).addEventListener("click", () => {
            if (validate()) {
                fetch(`/api/users/${userID}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        name: permName && name.value !== userName ? name.value : "",
                        tag: permName && tag.value !== userTag ? tag.value : "",
                        password: permPW && pw.value !== "" ? pw : ""
                    })
                }).then(r => {
                    if (r.ok) {
                        document.querySelectorAll(`.userDisplayElement`).forEach(e => e.update())
                        closeModal(id)
                    } else {
                        if (r.status >= 400 || r.status < 500) {
                            setErr(getTranslatedStr("network.issues.generic_request", {code: r.status}))
                        } else {
                            setErr(getTranslatedStr("network.issues.generic_server", {code: r.status}))
                        }
                    }
                });
            }
        })
        validate()
    })
}