function showModalCreateArticle(elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    let html = `<h2>${getTranslatedStr("articles.modify.title_create")}</h2>
                      <div class="textField">
                          <p>${getTranslatedStr("articles.title")}</p>
                          <input type="text" class="title">
                      </div>
                  
                      <div class="textField">
                          <p>${getTranslatedStr("articles.content")}</p>
                          <textarea class="body"></textarea>
                      </div>
                      <div class="stockInfluenceSelector"></div>
                                    
                      <div class="pair">
                          <div class="info"></div>
                          <button class="submit">${getTranslatedStr("articles.modify.submit_create")}</button>
                      </div>
                      `
    const id = createModal(html)
    const modal = document.getElementById(id)

    const infotxt = modal.querySelector(`.info`)
    const title = modal.querySelector(`.title`)
    const body = modal.querySelector(`.body`)
    const stockInfluenceSelector = new stockInfluenceSelectorElement()
    modal.querySelector(`div.stockInfluenceSelector`).append(stockInfluenceSelector)

    let permArticles = false, permInfluences = false, maxInfluence = 0
    userInformation.writePermission("canCreateArticles", perm => {
        if (perm !== 1) {
            modal.querySelector(".content").innerHTML = `<h2>${getTranslatedStr("articles.modify.title_create")}</h2><p>${getTranslatedStr("articles.modify.err_no_create_permission")}</p>`
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
            seterr(getTranslatedStr("articles.modify.err_title_too_short", {min: 10, max: 96}))
            return false
        }

        if (title.value.length > 96) {
            seterr(getTranslatedStr("articles.modify.err_title_too_long", {min: 10, max: 96}))
            return false
        }

        let escape = false
        stockInfluenceSelector.savedStocks.forEach(stockid => {
            if (!isNaN(stockid)) {
                const influenceDropdownElem = stockInfluenceSelector.querySelector(`div.containing[data-stock-id="${stockid}"] edit-influence`).dropdownElem
                if (influenceDropdownElem === undefined) {
                    seterr(getTranslatedStr("articles.modify.err_influences_generic"))
                    escape = true
                    return;
                }
                const permille = influenceDropdownElem.querySelector(`input.permille`)
                const minutes = influenceDropdownElem.querySelector(`input.minutes`)

                if (isNaN(minutes.value) || minutes.value === "" || Number(minutes.value) <= 0) {
                    seterr(getTranslatedStr("articles.modify.err_influences_length"))
                    escape = true
                    return;
                }
                if (isNaN(permille.value) || permille.value === "" || Number(permille.value) === 0) {
                    seterr(getTranslatedStr("articles.modify.err_influences_permille"))
                    escape = true
                    return
                }
                if (maxInfluence !== -1 && Math.abs(Number(permille.value)) > maxInfluence) {
                    seterr(getTranslatedStr("articles.modify.err_influences_permille_too_high", {max: maxInfluence}))
                    escape = true
                    return
                }
            }
        })
        if (escape) {
            return false
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

    modal.querySelector(`.submit`).addEventListener("click", () => {
        if (validate()) {
            const influences = []
            const pushInfluence = (stockid, permille, minutes, falloff) => {
                influences.push({
                    "StockID": stockid,
                    "LengthMinutes": minutes,
                    "PermillePerDay": permille,
                    "FalloffType": falloff
                })
            }

            stockInfluenceSelector.savedStocks.forEach(stockid => {
                if (!isNaN(stockid)) {
                    const numStockID = Number(stockid)
                    const influenceDropdownElem = stockInfluenceSelector.querySelector(`div.containing[data-stock-id="${numStockID}"] edit-influence`).dropdownElem

                    const permille = influenceDropdownElem.querySelector(`input.permille`)
                    const minutes = influenceDropdownElem.querySelector(`input.minutes`)
                    const falloff = influenceDropdownElem.querySelector(`falloff-selector`)

                    pushInfluence(stockid, Number(permille.value), Number(minutes.value), Number(falloff.value))
                }
            })
            fetch(`${window.location.origin}/api/articles`, {
                method: "POST",
                body: JSON.stringify({
                    title: title.value,
                    content: body.value,
                    influences: permInfluences ? influences : []
                })
            }).then(r => {
                if (r.ok) {
                    closeModal(id)
                    r.json().then(resp => {
                        window.history.pushState(null, null, `${window.location.origin}/articles/${resp["Data"]}`);
                        router(`/articles/${resp["Data"]}`)
                    })
                } else {
                    if (r.status >= 400 || r.status < 500) {
                        seterr(getTranslatedStr("network.issues.generic_request", {code: r.status}))
                    } else {
                        seterr(getTranslatedStr("network.issues.generic_server", {code: r.status}))
                    }
                }
            });
        }
    })
    validate()
}

