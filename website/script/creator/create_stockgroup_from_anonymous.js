function showModalCreateStockGroupFromAnonymous(elem) {
    if (elem != null && elem.parentElement?.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    if (!userInfo.checkPerm("canCreateStockGroups")) {
        createModal(`<h2>${getTranslatedStr("stockgroups.modify.title_create")}</h2><p>${getTranslatedStr("stockgroups.modify.err_no_create_permission")}</p>`)
        return
    }

    let html = `<h2>${getTranslatedStr("stockgroups.modify.title_create_from_anonymous")}</h2>
                        <div class="pair">
                            <p>${getTranslatedStr("stockgroups.modify.name")}</p>
                            <input class="name" type="text" placeholder="${getTranslatedStr("stockgroups.modify.name_placeholder")}">
                        </div>
                        <div class="textField">
                            <p>${getTranslatedStr("stockgroups.modify.description")}</p>
                            <textarea class="description"></textarea>
                        </div>
                        <div class="stockSelector"></div>
                      
                        <div class="pair submit">
                            <div class="info"></div>
                            <button class="submit">${getTranslatedStr("stockgroups.modify.submit_create")}</button>
                        </div>
                        `

    const id = createModal(html)

    const modal = document.getElementById(id);
    const infotxt = modal.querySelector(".info")
    const name = modal.querySelector(`.name`)
    const description = modal.querySelector(`.description`)
    const stockSelector = new stockSelectorElement()
    stockSelector.setStocks(anonymousStockGroupMembers)
    modal.querySelector(`div.stockSelector`).append(stockSelector)

    const setErr = createSetErr(infotxt)

    const validate = () => {
        if (name.value.length > 32) {
            setErr(getTranslatedStr("stockgroups.modify.err_name_too_long", {min: 2, max: 32}))
            return false
        }
        if (name.value.length < 2) {
            setErr(getTranslatedStr("stockgroups.modify.err_name_too_short", {min: 2, max: 32}))
            return false
        }

        infotxt.innerHTML = getTranslatedStr("stockgroups.modify.values_okay")
        infotxt.classList.add("positive")
        infotxt.classList.remove("negative")
        return true
    }
    modal.querySelectorAll(`textarea.description`).forEach(elem => {
        elem.addEventListener("input", () => {
            elem.style.height = "1px"
            elem.style.height = elem.scrollHeight + "px"
        })
    })

    modal.querySelectorAll(`.pair input`).forEach(elem => {
        elem.addEventListener("input", () => validate())
    })

    modal.querySelector(`button.submit`).addEventListener("click", () => {
        if (validate()) {
            const members = []
            stockSelector.savedStocks.forEach(stockid => {
                if (!isNaN(stockid)) {
                    members.push(Number(stockid))
                }
            })
            fetch(`${window.location.origin}/api/stockgroups`, {
                method: "POST",
                body: JSON.stringify({
                    Name: name.value,
                    Description: description.value,
                    Members: members
                })

            }).then(r => {
                if (r.ok) {
                    closeModal(id)
                    r.json().then(resp => {
                        window.history.pushState(null, null, `${window.location.origin}/groups/${resp["Data"]}`);
                        router(`/groups/${resp["Data"]}`)
                    })
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

