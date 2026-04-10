function showModalCreateUser(elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    if (!userInfo.checkPerm("canCreateUsers")) {
        createModal(`<h2>${getTranslatedStr("users.create.title")}</h2><p>${getTranslatedStr("users.create.err_no_create_permission")}</p>`)
        return
    }

    let html = `<h2>${getTranslatedStr("users.create.title")}</h2>
                      <div class="pair">
                          <p>${getTranslatedStr("users.create.tag")}</p>
                          <input type="text" class="tag">            
                      </div>
                        
                      <div class="pair">
                          <p>${getTranslatedStr("users.create.temp_pw")}</p>
                          <input type="password" class="pw1">            
                      </div>
                      
                      <div class="pair">
                          <p>${getTranslatedStr("users.create.temp_pw_repeat")}</p>
                          <input type="password" class="pw2">            
                      </div>
                                    
                      <div class="pair submit">
                          <div class="info"></div>
                          <button class="submit">${getTranslatedStr("users.create.submit")}</button>
                      </div>
                      `
    const id = createModal(html)
    const modal = document.getElementById(id)

    const infotxt = modal.querySelector(`.info`)
    const tag = modal.querySelector(`.tag`)
    const pw = modal.querySelector(`.pw1`)
    const pwrep = modal.querySelector(`.pw2`)
    
    const setErr = createSetErr(infotxt)

    const plausibleTag = t => {
        if (t !== t.toLowerCase()) {
            return false
        }

        for (let i = 0; i < t.length; i++) {
            const c = t.charAt(i)
            if (!isNaN(+c)) {
                continue
            }
            if (c.match(/[a-z]/i)) {
                continue
            }
            return false
        }
        return t.length >= 2 && t.length <= 32
    }

    const validate = () => {
        if (!plausibleTag(tag.value)) {
            setErr(getTranslatedStr("users.create.err_tag_implausible"))
            return false
        }

        if (!plausiblePassword(pw.value)) {
            setErr(getTranslatedStr("users.create.err_pw_implausible"))
            return false
        }

        if (pw.value !== pwrep.value) {
            setErr(getTranslatedStr("users.create.err_pw_repeat"))
            return false
        }

        infotxt.innerHTML = getTranslatedStr("users.create.values_okay")
        infotxt.classList.add("positive")
        infotxt.classList.remove("negative")
        return true
    }

    modal.querySelectorAll(`.pair input`).forEach(elem => {
        elem.addEventListener("input", () => validate())
    })

    modal.querySelector(`button.submit`).addEventListener("click", () => {
        if (validate()) {
            fetch(`${window.location.origin}/api/users`, {
                method: "POST",
                body: JSON.stringify({
                    tag: tag.value,
                    password: pw.value
                })
            }).then(r => {
                if (r.ok) {
                    closeModal(id)
                    document.querySelectorAll(`.userDisplayElement`).forEach(e => e.update())
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
}

