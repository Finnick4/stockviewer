
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
        const artInfluences = []
        if (resp["Data"]["Influences"] !== null) {
            resp["Data"]["Influences"].forEach(influence => {
                artInfluences.push({
                    "StockID": influence.StockID,
                    "StockName": influence.StockName,
                    "LengthMinutes": influence.LengthMinutes,
                    "PermillePerDay": influence.PermillePerDay
                })
            })
        }

        let html = `<h2>Edit an article</h2>
                      <div class="textField">
                          <p>Title</p>
                          <input type="text" class="title" value="${sanitiseText(artTitle)}">
                      </div>
       
                      <div class="textField">
                          <p>Content</p>
                          <textarea class="body">${sanitiseText(artContent)}</textarea>
                      </div>
                      <div class="stockInfluenceSelector"></div>
                                    
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
        const stockInfluenceSelector = new stockInfluenceSelectorElement()
        modal.querySelector(`div.stockInfluenceSelector`).append(stockInfluenceSelector)
        stockInfluenceSelector.setInfluences(artInfluences)

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

            let escape = false
            stockInfluenceSelector.savedStocks.forEach(stockid => {
                if (!isNaN(stockid)) {
                    const permille = stockInfluenceSelector.querySelector(`li.stockOverview[data-stock-id="${stockid}"] input.permille`)
                    const minutes = stockInfluenceSelector.querySelector(`li.stockOverview[data-stock-id="${stockid}"] input.minutes`)
                    const originalState = artInfluences.find(influence => influence.StockID === stockid)
                    const hasBeenAdded = originalState === undefined

                    if (isNaN(minutes.value) || minutes.value === "" || Number(minutes.value) <= 0) {
                        seterr("All lengths have to be positive and not 0!")
                        escape = true
                        return;
                    }
                    if (isNaN(permille.value) || permille.value === "" || Number(permille.value) === 0) {
                        seterr("Permilles have to be numeric and not 0!")
                        escape = true
                        return
                    }
                    if ((hasBeenAdded || (Number(originalState.PermillePerDay) !== Number(permille.value))) && (maxInfluence !== -1 && Math.abs(Number(permille.value)) > maxInfluence)) {
                        seterr(`Cannot set permille higher than ${maxInfluence}!`)
                        escape = true
                        return
                    }
                }
            })
            if (escape) {
                return false
            }

            infotxt.innerHTML = "Everything seems to be okay!"
            infotxt.classList.add("positive")
            infotxt.classList.remove("negative")
            return true
        }

        stockInfluenceSelector.onEdit = validate

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
                let added = [], edited = [], removed = artInfluences.map(x => Number(x.StockID))
                const pushAddedInfluence = (stockid, permille, minutes) => {
                    added.push({
                        "StockID": Number(stockid),
                        "LengthMinutes": Number(minutes),
                        "PermillePerDay": Number(permille)
                    })
                }
                const pushEditedInfluence = (stockid, permille, minutes) => {
                    edited.push({
                        "StockID": Number(stockid),
                        "ArticleID": Number(articleId),
                        "LengthMinutes": Number(minutes),
                        "PermillePerDay": Number(permille)
                    })
                }
                stockInfluenceSelector.savedStocks.forEach(stockid => {
                    if (!isNaN(stockid)) {
                        const numStockID = Number(stockid)

                        const permille = stockInfluenceSelector.querySelector(`li.stockOverview[data-stock-id="${numStockID}"] input.permille`)
                        const minutes = stockInfluenceSelector.querySelector(`li.stockOverview[data-stock-id="${numStockID}"] input.minutes`)
                        const originalState = artInfluences.find(influence => influence.StockID === stockid)

                        if (artInfluences.some(influence => Number(influence.StockID) === numStockID)) { //influence war schon vorher da und ist das immernoch
                            removed = removed.filter(s => numStockID !== s)
                            if (!(Number(permille.value) === originalState.PermillePerDay && Number(minutes.value) === originalState.LengthMinutes)) {
                                pushEditedInfluence(numStockID, Number(permille.value), Number(minutes.value))
                            }
                        } else {
                            if (!removed.includes(numStockID)) {
                                pushAddedInfluence(numStockID, Number(permille.value), Number(minutes.value))
                            }
                        }
                    }
                })

                fetch(`${window.location.origin}/api/articles`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        id: Number(articleId),
                        title: title.value,
                        content: body.value,
                        AddedInfluences: permInfluences ? added : [],
                        EditedInfluences: permInfluences ? edited : [],
                        RemovedInfluences: permInfluences ? removed : []
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