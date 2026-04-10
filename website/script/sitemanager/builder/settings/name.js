function buildSettingsNamePage() {
    const main = `
        <h1>${getTranslatedStr("settings.name.title")}</h1>
        <div class="actions">
            <div class="pair">
                <p>${getTranslatedStr("settings.name.name")}</p>
                <input class="displayname" type="text" placeholder="${getTranslatedStr("users.edit.placeholder_name")}" value="${userInfo.name}">
            </div>
            <div class="pair">
                <p>${getTranslatedStr("settings.name.tag")}</p>
                <input class="tag" type="text" placeholder="${getTranslatedStr("users.edit.placeholder_tag")}" value="${userInfo.tag}">
            </div>
            <div class="pair submit">
                <div class="info"></div>
                <button class="submit">${getTranslatedStr("settings.name.submit")}</button>
            </div>
        </div>`
            
    setMainBodyHTMLAndSidebar(main, getSettingsSidebar("name"))

    const infotxt = document.querySelector("main div.actions .info")
    const setErr = createSetErr(infotxt)
    const nameElem = document.querySelector("main div.actions input.displayname")
    const tagElem = document.querySelector("main div.actions input.tag")

    const verify = () => {
        if (!verifyUserName(nameElem.value, setErr)) {
            return false
        }

        if (!verifyUserTag(tagElem.value, setErr)) {
            return false
        }

        infotxt.innerHTML = getTranslatedStr("settings.name.values_okay")
        infotxt.classList.add("positive")
        infotxt.classList.remove("negative")
        return true
    }

    document.querySelectorAll(`main div.actions .pair input`).forEach(elem => {
        elem.addEventListener("input", () => verify())
    })

    document.querySelector("main div.actions button.submit").addEventListener("click", () => {
        if (verify() && (nameElem.value !== userInfo.name || tagElem.value !== userInfo.tag)) {
            fetch(`/api/users/self`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: nameElem.value !== userInfo.name ? nameElem.value : "",
                    tag: tagElem.value !== userInfo.tag ? tagElem.value : ""
                })
            }).then(r => {
                if (r.ok) {
                    infotxt.innerHTML = getTranslatedStr("settings.name.success")
                    initialiseUserInfo()
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
            })
        }
    })
}