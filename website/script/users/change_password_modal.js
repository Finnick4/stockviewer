function showChangePasswordModal(elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    let html = `<h2>${getTranslatedStr("change_password.title")}</h2>
                      <div class="pair">
                          <p>${getTranslatedStr("change_password.tag")}</p>
                          <input type="text" class="tag">            
                      </div>
                        
                      <div class="pair">
                          <p>${getTranslatedStr("change_password.old_pw")}</p>
                          <input type="password" class="oldpw">            
                      </div>
                      
                      <div class="pair">
                          <p>${getTranslatedStr("change_password.new_pw")}</p>
                          <input type="password" class="newpw1">            
                      </div>
                      
                      <div class="pair">
                          <p>${getTranslatedStr("change_password.new_pw_repeat")}</p>
                          <input type="password" class="newpw2">            
                      </div>
                                    
                      <div class="pair">
                          <div class="info"></div>
                          <button class="submit">${getTranslatedStr("change_password.submit")}</button>
                      </div>
                      `
    const id = createModal(html)
    const modal = document.getElementById(id)

    const infotxt = modal.querySelector(`.info`)
    const tag = modal.querySelector(`.tag`)
    const oldPW = modal.querySelector(`.oldpw`)
    const newPW1 = modal.querySelector(`.newpw1`)
    const newPW2 = modal.querySelector(`.newpw2`)

    const setErr = createSetErr(infotxt)

    const plausiblePW = pw => {
        return pw.length >= 8 && pw.length <= 72
    }

    const validate = () => {
        if (tag.value.length > 32) {
            setErr(getTranslatedStr("change_password.err_tag_too_long", {min: 2, max: 32}))
            return false
        }
        if (tag.value.length <= 2) {
            setErr(getTranslatedStr("change_password.err_tag_too_short", {min: 2, max: 32}))
            return false
        }

        if (!plausiblePW(oldPW.value)) {
            setErr(getTranslatedStr("change_password.err_old_pw_implausible"))
            return false
        }

        if (!plausiblePW(newPW1.value)) {
            setErr(getTranslatedStr("change_password.err_new_pw_implausible"))
            return false
        }

        if (newPW1.value !== newPW2.value) {
            setErr(getTranslatedStr("change_password.err_pw_repetition"))
            return false
        }

        infotxt.innerHTML = getTranslatedStr("change_password.values_okay")
        infotxt.classList.add("positive")
        infotxt.classList.remove("negative")
        return true
    }

    modal.querySelectorAll(`.pair input`).forEach(elem => {
        elem.addEventListener("input", () => validate())
    })

    modal.querySelector(`.submit`).addEventListener("click", () => {
        if (validate()) {
            fetch(`${window.location.origin}/api/users/login`, {
                method: "PATCH",
                body: JSON.stringify({
                    tag: tag.value,
                    oldpassword: oldPW.value,
                    newpassword: newPW1.value
                })
            }).then(r => {
                if (r.ok) {
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
}