
class editArticleButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.articleid = Number(this.dataset.articleId)

        this.classList.add("edit")

        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="${getTranslatedStr("articles.modify.edit_icon_alt_text")}" draggable="false">`
        this.title = getTranslatedStr("articles.modify.edit_icon_alt_text")

        this.onclick = () => showModalEditArticles(this.articleid)
    }
}

customElements.define('edit-article-button', editArticleButtonElement, {extends: "button"});

function showModalEditArticles(articleId) {
    fetch(`/api/articles/${articleId}`).then(r => r.json()).then(resp => {
        const artTitle = sanitiseText(resp["Data"]["Title"])
        const artContent = sanitiseText(resp["Data"]["Content"])
        const artInfluences = []
        if (resp["Data"]["Influences"] !== null) {
            resp["Data"]["Influences"].forEach(influence => {
                artInfluences.push({
                    "StockID": influence.StockID,
                    "StockName": influence.StockName,
                    "LengthMinutes": influence.LengthMinutes,
                    "PermillePerDay": influence.PermillePerDay,
                    "FalloffType": influence.FalloffType
                })
            })
        }

        const permArticles = userInfo.checkPerm("canEditArticles")
        const permInfluences = userInfo.checkPerm("canModifyInfluences")
        const maxInfluence = userInfo.permissions.get("maxInfluencePermille")

        const permDelete = userInfo.checkPerm("canDeleteArticles")
        const dangerZoneVisible = permDelete

        let html = `<h2>${getTranslatedStr("articles.modify.title_edit")}</h2>
                      ${!permArticles && !permInfluences && !permDelete ? `<p>${getTranslatedStr("articles.modify.err_no_edit_permission")}</p>` : ""}

                      ${permArticles ?`<div class="textField">
                          <p>${getTranslatedStr("articles.title")}</p>
                          <input type="text" class="title" value="${sanitiseText(artTitle)}">
                      </div>` : ""}
       
                      ${permArticles ? `<div class="textField">
                          <p>${getTranslatedStr("articles.content")}</p>
                          <textarea class="body">${sanitiseText(artContent)}</textarea>
                      </div>` : ""}
                      
                      ${permInfluences ? `<div class="stockInfluenceSelector"></div>` : ""}
                                    
                      ${permArticles || permInfluences ? `<div class="pair submit">
                          <div class="info"></div>
                          <button class="submit">${getTranslatedStr("articles.modify.submit_edit")}</button>
                      </div>` : ""}
                      ${dangerZoneVisible ? `
                            <div class="dangerZone">
                                <h3 class="warning">${getTranslatedStr("articles.modify.danger.title")}</h3>
                                <p class="warning">${getTranslatedStr("articles.modify.danger.subtitle")}</p>
                                ${permDelete ? `
                                    <div class="pair">
                                        <p>${getTranslatedStr("articles.modify.danger.delete")}</p>
                                        <button class="delete">${getTranslatedStr("articles.modify.danger.delete_button")}</button>                        
                                    </div>
                                ` : ""}
                            </div>` : ""}
                      `
        const id = createModal(html)
        const modal = document.getElementById(id)

        const infotxt = modal.querySelector(`.info`)
        const title = modal.querySelector(`.title`)
        const body = modal.querySelector(`.body`)

        if (permDelete) {
            const deleteBtn = modal.querySelector("button.delete")
            deleteBtn.addEventListener("click", () => showRepeatPhraseModal(artTitle, () => {
                fetch(`/api/articles/${articleId}`, {
                    method: "DELETE"
                }).then(r => {
                    if (r.ok) {
                        closeModal(id)
                        window.history.pushState(null, null, `${window.location.origin}/articles`);
                        router()
                    } else {
                        console.error(`Something went wrong! 
                                Code: ${r.status}
                                MSG: ${r.statusText}`)
                    }
                });
            },  "article_delete"))
        }

        if (permArticles || permInfluences) {
            const stockInfluenceSelector = new stockInfluenceSelectorElement()
            if (permInfluences) {
                modal.querySelector(`div.stockInfluenceSelector`).append(stockInfluenceSelector)
                stockInfluenceSelector.setInfluences(artInfluences)
            }

            body.style.height = "1px"
            body.style.height = body.scrollHeight + "px"

            const setErr = createSetErr(infotxt)

            const validate = () => {
                if (title.value.length < 10) {
                    setErr(getTranslatedStr("articles.modify.err_title_too_short", {min: 10, max: 96}))
                    return false
                }

                if (title.value.length > 96) {
                    setErr(getTranslatedStr("articles.modify.err_title_too_long", {min: 10, max: 96}))
                    return false
                }

                if (permInfluences) {
                    let escape = false
                    stockInfluenceSelector.savedStocks.forEach(stockid => {
                        if (!isNaN(stockid)) {
                            const influenceDropdownElem = stockInfluenceSelector.querySelector(`div.containing[data-stock-id="${stockid}"] edit-influence`).dropdownElem
                            if (influenceDropdownElem === undefined) {
                                setErr(getTranslatedStr("articles.modify.err_influences_generic"))
                                escape = true
                                return;
                            }
                            const permille = influenceDropdownElem.querySelector(`input.permille`)
                            const minutes = influenceDropdownElem.querySelector(`input.minutes`)
                            const originalState = artInfluences.find(influence => influence.StockID === stockid)
                            const hasBeenAdded = originalState === undefined

                            if (isNaN(minutes.value) || minutes.value === "" || Number(minutes.value) <= 0) {
                                setErr(getTranslatedStr("articles.modify.err_influences_length"))
                                escape = true
                                return;
                            }
                            if (isNaN(permille.value) || permille.value === "" || Number(permille.value) === 0) {
                                setErr(getTranslatedStr("articles.modify.err_influences_permille"))
                                escape = true
                                return
                            }
                            if ((hasBeenAdded || (Number(originalState.PermillePerDay) !== Number(permille.value))) && (maxInfluence !== -1 && Math.abs(Number(permille.value)) > maxInfluence)) {
                                setErr(getTranslatedStr("articles.modify.err_influences_permille_too_high", {max: maxInfluence}))
                                escape = true
                                return
                            }
                        }
                    })
                    if (escape) {
                        return false
                    }
                }
                infotxt.innerHTML = getTranslatedStr("articles.modify.values_okay")
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

            modal.querySelector(`button.submit`).addEventListener("click", () => {
                if (validate()) {
                    let added = [], edited = [], removed = []

                    if (permInfluences) {
                        removed = artInfluences.map(x => Number(x.StockID))
                        const pushAddedInfluence = (stockid, permille, minutes, falloff) => {
                            added.push({
                                "StockID": Number(stockid),
                                "LengthMinutes": Number(minutes),
                                "PermillePerDay": Number(permille),
                                "FalloffType": Number(falloff)
                            })
                        }
                        const pushEditedInfluence = (stockid, permille, minutes, falloff) => {
                            edited.push({
                                "StockID": Number(stockid),
                                "ArticleID": Number(articleId),
                                "LengthMinutes": Number(minutes),
                                "PermillePerDay": Number(permille),
                                "FalloffType": Number(falloff)
                            })
                        }
                        stockInfluenceSelector.savedStocks.forEach(stockid => {
                            if (!isNaN(stockid)) {
                                const numStockID = Number(stockid)
                                const influenceDropdownElem = stockInfluenceSelector.querySelector(`div.containing[data-stock-id="${numStockID}"] edit-influence`).dropdownElem

                                const permille = influenceDropdownElem.querySelector(`input.permille`)
                                const minutes = influenceDropdownElem.querySelector(`input.minutes`)
                                const falloff = influenceDropdownElem.querySelector(`falloff-selector`)
                                const originalState = artInfluences.find(influence => influence.StockID === stockid)

                                if (artInfluences.some(influence => Number(influence.StockID) === numStockID)) {
                                    removed = removed.filter(s => numStockID !== s)
                                    if (!(Number(permille.value) === originalState.PermillePerDay && Number(minutes.value) === originalState.LengthMinutes && Number(falloff.value) === originalState.FalloffType)) {
                                        pushEditedInfluence(numStockID, Number(permille.value), Number(minutes.value), Number(falloff.value))
                                    }
                                } else {
                                    if (!removed.includes(numStockID)) {
                                        pushAddedInfluence(numStockID, Number(permille.value), Number(minutes.value), Number(falloff.value))
                                    }
                                }
                            }
                        })
                    }


                    fetch(`${window.location.origin}/api/articles/${articleId}`, {
                        method: "PATCH",
                        body: JSON.stringify({
                            title: title.value,
                            content: body.value === artContent ? "" : body.value,
                            RemoveContent: body.value === "",
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

    })
}