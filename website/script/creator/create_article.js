function showModalCreateArticle(elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    let html = `<h2>Write an article</h2>
                      <div class="textField">
                          <p>Title</p>
                          <input type="text" class="title">
                      </div>
                  
                      <div class="textField">
                          <p>Content</p>
                          <textarea class="body"></textarea>
                      </div>
                                    
                      <div class="pair">
                          <div class="info"></div>
                          <button class="submit">Sumbit</button>
                      </div>
                      `
    const id = createModal(html)
    const modal = document.getElementById(id)

    const infotxt = modal.querySelector(`.info`)
    const title = modal.querySelector(`.title`)
    const body = modal.querySelector(`.body`)


    userInformation.writePermission("canCreateArticles", perm => {
        if (perm !== 1) {
            modal.querySelector(".content").innerHTML = "<h2>Write an article</h2><p>It doesn't seem like you are able to write articles currently!</p>"
        }
    })

    const seterr = err => {
        infotxt.innerHTML = err
        infotxt.classList.add("negative")
        infotxt.classList.remove("positive")
    }

    const validate = () => {
        if (title.value.length < 10) {
            seterr("The title is too short!")
            return false
        }

        if (title.value.length > 96) {
            seterr("The title is too long!")
            return false
        }


        infotxt.innerHTML = "Everything seems to be okay!"
        infotxt.classList.add("positive")
        infotxt.classList.remove("negative")
        return true
    }

    modal.querySelectorAll(`input`).forEach(elem => {
        elem.addEventListener("input", () => validate())
    })

    modal.querySelectorAll(`textarea.body`).forEach(elem => {
        elem.addEventListener("input", () => {
            elem.style.height = "1px"
            elem.style.height = elem.scrollHeight + "px"
        })
    })

    modal.querySelector(`.submit`).addEventListener("click", () => {
        if (validate()) {
            fetch(`${window.location.origin}/api/articles`, {
                method: "POST",
                body: JSON.stringify({
                    title: title.value,
                    content: body.value
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

