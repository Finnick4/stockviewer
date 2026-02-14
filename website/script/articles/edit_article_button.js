
class editArticleButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.articleid = this.getAttribute("data-articleid")

        fetch(`/api/articles?id=${Number(this.articleid)}`).then(r => r.json()).then(resp => {
            this.artTitle = sanitiseText(resp["Data"]["Title"])
            this.artContent = sanitiseText(resp["Data"]["Content"])
        })

        this.classList.add("edit")

        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="edit" draggable="false">`

        this.onclick = () => {
            if (this.artTitle === "") {
                fetch(`/api/articles?id=${this.articleid}`).then(r => r.json()).then(resp => {
                    this.artTitle = sanitiseText(resp["Data"]["Title"])
                    this.artContent = sanitiseText(resp["Data"]["Content"])
                })
            }

            let html = `<h2>Edit an article</h2>
                      <div class="textField">
                          <p>Title</p>
                          <input type="text" class="title" value="${sanitiseText(this.artTitle)}">
                      </div>
       
                  
                      <div class="textField">
                          <p>Content</p>
                          <textarea class="body">${sanitiseText(this.artContent)}</textarea>
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

            body.style.height = "1px"
            body.style.height = body.scrollHeight + "px"

            userInformation.writePermission("canCreateArticles", perm => {
                if (perm !== 1) {
                    modal.querySelector(".content").innerHTML = "<h2>Edit an article</h2><p>It doesn't seem like you are able to edit articles currently!</p>"
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
                        method: "PATCH",
                        body: JSON.stringify({
                            id: Number(this.articleid),
                            title: title.value,
                            content: body.value
                        })
                    }).then(r => {
                        if (r.ok) {
                            closeModal(id)
                            buildIndividualArticlePage(this.articleid)
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
    }
}

customElements.define('edit-article-button', editArticleButtonElement, {extends: "button"});
