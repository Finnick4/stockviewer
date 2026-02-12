function showChangePasswordModal(elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    let html = `<h2>Change password</h2>
                      <div class="pair">
                          <p>Username</p>
                          <input type="text" class="name">            
                      </div>
                        
                      <div class="pair">
                          <p>Old password</p>
                          <input type="password" class="oldpw">            
                      </div>
                      
                      <div class="pair">
                          <p>New password</p>
                          <input type="password" class="newpw1">            
                      </div>
                      
                      <div class="pair">
                          <p>Repeat new password</p>
                          <input type="password" class="newpw2">            
                      </div>
                                    
                      <div class="pair">
                          <div class="info"></div>
                          <button class="submit">Sumbit</button>
                      </div>
                      `
    const id = createModal(html)
    const modal = document.getElementById(id)

    const infotxt = modal.querySelector(`.info`)
    const name = modal.querySelector(`.name`)
    const oldPW = modal.querySelector(`.oldpw`)
    const newPW1 = modal.querySelector(`.newpw1`)
    const newPW2 = modal.querySelector(`.newpw2`)

    const seterr = err => {
        infotxt.innerHTML = err
        infotxt.classList.add("negative")
        infotxt.classList.remove("positive")
    }

    const plausiblePW = pw => {
        return pw.length >= 8 && pw.length <= 72
    }

    const validate = () => {
        if (name.value.length > 32) {
            seterr("The name is too long! (2 - 32 characters)")
            return false
        }
        if (name.value.length <= 2) {
            seterr("The name is too short! (2 - 32 characters)")
            return false
        }

        if (!plausiblePW(oldPW.value)) {
            seterr("The old password is not plausible!")
            return false
        }

        if (!plausiblePW(newPW1.value)) {
            seterr("The new password is not plausible!")
            return false
        }

        if (newPW1.value !== newPW2.value) {
            seterr("The new password isn't identical to the repetition!")
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
            fetch(`${window.location.origin}/api/users/login`, {
                method: "PATCH",
                body: JSON.stringify({
                    username: name.value,
                    oldpassword: oldPW.value,
                    newpassword: newPW1.value
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