
class editStockGroupButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.groupid = Number(this.dataset.stockGroupId)

        this.classList.add("edit")

        if (Number(this.groupid) === 0) {

        } else {
            this.onclick = () => showModalEditStockGroup(this.groupid)
        }

        this.title = getTranslatedStr("stockgroups.modify.edit_icon_alt_text")
        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="${getTranslatedStr("stockgroups.modify.edit_icon_alt_text")}" draggable="false">`
    }

}

customElements.define('edit-stock-group-button', editStockGroupButtonElement, {extends: "button"});


function showModalEditStockGroup(groupid) {
    fetch(`/api/stockgroups/${groupid}`).then(r => r.json()).then(resp => {
        const groupName = sanitiseText(resp["Data"]["Name"])
        const groupDescription = sanitiseText(resp["Data"]["Description"])
        const groupMembers = resp["Data"]["Members"] !== null ? resp["Data"]["Members"].map(stock => Number(stock["ID"])) : []

        let html = `<h2>${getTranslatedStr("stockgroups.modify.title_edit", {name: sanitiseText(groupName)})}</h2>
                        <div class="pair">
                            <p>${getTranslatedStr("stockgroups.modify.name")}</p>
                            <input class="name" type="text" placeholder="${getTranslatedStr("stockgroups.modify.name_placeholder")}" value="${sanitiseText(groupName)}">
                        </div>
                        <div class="textField">
                            <p>${getTranslatedStr("stockgroups.modify.description")}</p>
                            <textarea class="description">${groupDescription}</textarea>
                        </div>
                        <div class="stockSelector"></div>
                      
                        <div class="pair submit">
                            <div class="info"></div>
                            <button class="submit">${getTranslatedStr("stockgroups.modify.submit_edit")}</button>
                        </div>
                        `

        const id = createModal(html)

        const modal = document.getElementById(id);
        const infotxt = modal.querySelector(".info")
        const name = modal.querySelector(`.name`)
        const description = modal.querySelector(`.description`)
        const stockSelector = new stockSelectorElement()
        stockSelector.setStocks(groupMembers)
        modal.querySelector(`div.stockSelector`).append(stockSelector)

        description.style.height = "1px"
        description.style.height = description.scrollHeight + "px"

        let permName = false, permDesc = false, permMembers = false

        if (!userInfo.checkPerm("canEditStockGroupNames")) {
            name.readOnly = true
        } else {
            permName = true
        }
        if (!userInfo.checkPerm("canEditStockGroupDescriptions")) {
            description.readOnly = true
        } else {
            permDesc = true
        }
        if (!userInfo.checkPerm("canEditStockGroupMembers")) {
            stockSelector.readOnly = true
        } else {
            permMembers = true
        }

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

        modal.querySelector("button.submit").addEventListener("click", () => {
            if (validate()) {
                let added = [], removed = groupMembers.map(x => x)
                stockSelector.savedStocks.forEach(stockid => {
                    if (!isNaN(stockid)) {
                        const numStockID = Number(stockid)
                        if (groupMembers.includes(numStockID)) {
                            removed = removed.filter(s => numStockID !== s)
                        } else {
                            added.push(numStockID)
                        }
                    }
                })
                fetch(`${window.location.origin}/api/stockgroups/${groupid}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        Name: permName && name.value !== groupName ? name.value : "",
                        Description: permDesc && description.value !== groupDescription ? description.value : "",
                        AddedMembers: permMembers && added.length !== 0 ? added : [],
                        RemovedMembers: permMembers && removed.length !== 0 ? removed : []
                    })
                }).then(r => {
                    if (r.ok) {
                        closeModal(id)
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
    })
}
