
class editArticleButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.articleid = this.getAttribute("data-articleid")

        this.classList.add("edit")

        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="edit" draggable="false">`

        this.onclick = () => showModalEditArticles(this.articleid)
    }
}

customElements.define('edit-article-button', editArticleButtonElement, {extends: "button"});

function showModalEditArticles(articleId) {
    fetch(`/api/articles?id=${articleId}`).then(r => r.json()).then(resp => {
        const artTitle = sanitiseText(resp["Data"]["Title"])
        const artContent = sanitiseText(resp["Data"]["Content"])

        let html = `<h2>Edit an article</h2>
                      <div class="textField">
                          <p>Title</p>
                          <input type="text" class="title" value="${sanitiseText(artTitle)}">
                      </div>
       
                  
                      <div class="textField">
                          <p>Content</p>
                          <textarea class="body">${sanitiseText(artContent)}</textarea>
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

        let permArticles = false, permInfluences = false, maxInfluence = 0
        userInformation.writePermission("canEditArticles", perm => {
            if (perm !== 1) {
                modal.querySelector(".content").innerHTML = "<h2>Write an article</h2><p>It doesn't seem like you are able to edit articles currently!</p>"
            } else {
                permArticles = true
            }
        })
        userInformation.writePermission("canModifyInfluences", perm => {
            if (perm !== 1) {
                stockInfluenceSelector.readOnly = true
            } else {
                permInfluences = true
            }
        })
        userInformation.writePermission("maxInfluencePermille", perm => {
            maxInfluence = perm
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
                        id: Number(articleId),
                        title: title.value,
                        content: body.value
                    })
                }).then(r => {
                    if (r.ok) {
                        closeModal(id)
                        buildIndividualArticlePage(articleId)
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


    })
}