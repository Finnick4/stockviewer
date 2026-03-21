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

    let permArticles = false, permInfluences = false, maxInfluence = 0
    userInformation.writePermission("canCreateArticles", perm => {
        if (perm !== 1) {
            modal.querySelector(".content").innerHTML = "<h2>Write an article</h2><p>It doesn't seem like you are able to write articles currently!</p>"
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
                const influenceDropdownElem = stockInfluenceSelector.querySelector(`li.stockOverview[data-stock-id="${stockid}"] edit-influence`).dropdownElem
                if (influenceDropdownElem === undefined) {
                    seterr("There was an error while checking the influences!")
                    escape = true
                    return;
                }
                const permille = influenceDropdownElem.querySelector(`input.permille`)
                const minutes = influenceDropdownElem.querySelector(`input.minutes`)

                if (isNaN(minutes.value) || minutes.value === "" || Number(minutes.value) <= 0) {
                    seterr("All lengths have to be positive!")
                    escape = true
                    return;
                }
                if (isNaN(permille.value) || permille.value === "" || Number(permille.value) === 0) {
                    seterr("Permilles have to be numeric and not 0!")
                    escape = true
                    return
                }
                if (maxInfluence !== -1 && Math.abs(Number(permille.value)) > maxInfluence) {
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
                    const influenceDropdownElem = stockInfluenceSelector.querySelector(`li.stockOverview[data-stock-id="${numStockID}"] edit-influence`).dropdownElem

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

