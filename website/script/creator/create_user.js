function showModalCreateUser(elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    let html = `<h2>Create a new user</h2>
                      <div class="pair">
                          <p>User tag</p>
                          <input type="text" class="tag">            
                      </div>
                        
                      <div class="pair">
                          <p>Temporary password</p>
                          <input type="password" class="pw1">            
                      </div>
                      
                      <div class="pair">
                          <p>Repeat temporary password</p>
                          <input type="password" class="pw2">            
                      </div>
                                    
                      <div class="pair">
                          <div class="info"></div>
                          <button class="submit">Sumbit</button>
                      </div>
                      `
    const id = createModal(html)
    const modal = document.getElementById(id)

    const infotxt = modal.querySelector(`.info`)
    const tag = modal.querySelector(`.tag`)
    const pw = modal.querySelector(`.pw1`)
    const pwrep = modal.querySelector(`.pw2`)


    userInformation.writePermission("canCreateUsers", perm => {
        if (perm !== 1) {
            modal.querySelector(".content").innerHTML = "<h2>Create a new user</h2><p>It doesn't seem like you are able to create users currently!</p>"
        }
    })

    const seterr = err => {
        infotxt.innerHTML = err
        infotxt.classList.add("negative")
        infotxt.classList.remove("positive")
    }

    const plausiblePW = pw => {
        return pw.length >= 8 && pw.length <= 72
    }

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
            seterr("The tag is not plausible!")
            return false
        }

        if (!plausiblePW(pw.value)) {
            seterr("The password is not plausible!")
            return false
        }

        if (pw.value !== pwrep.value) {
            seterr("The password isn't identical to the repetition!")
            return false
        }

        infotxt.innerHTML = "Everything seems to be okay!"
        infotxt.classList.add("positive")
        infotxt.classList.remove("negative")
        return true
    }

    modal.querySelectorAll(`.pair input`).forEach(elem => {
        elem.addEventListener("input", () => validate())
    })

    modal.querySelector(`.submit`).addEventListener("click", () => {
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
                } else {
                    if (r.status >= 400 || r.status < 500) {
                        seterr("There is an issue with the request.")
                    } else {
                        seterr("There is a server-side issue causing this request to not be processed!")
                    }
                }
            });
        }
    })
    validate()
}

