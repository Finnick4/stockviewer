
class editStockGroupButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.groupid = Number(this.dataset.stockGroupId)

        this.classList.add("edit")

        if (Number(this.groupid) === 0) {
            this.onclick = () => showModalEditAnonymousStockGroup()
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

        const permName = userInfo.checkPerm("canEditStockGroupNames")
        const permDesc = userInfo.checkPerm("canEditStockGroupDescriptions")
        const permMembers = userInfo.checkPerm("canEditStockGroupMembers")

        const permDelete = userInfo.checkPerm("canDeleteStockGroups")
        const dangerZoneVisible = permDelete

        let html = `<h2>${getTranslatedStr("stockgroups.modify.title_edit", {name: sanitiseText(groupName)})}</h2>
                        ${permName ? `
                        <div class="pair">
                            <p>${getTranslatedStr("stockgroups.modify.name")}</p>
                            <input class="name" type="text" placeholder="${getTranslatedStr("stockgroups.modify.name_placeholder")}" value="${sanitiseText(groupName)}">
                        </div>` : ""}
                        
                        ${permDesc ? `
                        <div class="textField">
                            <p>${getTranslatedStr("stockgroups.modify.description")}</p>
                            <textarea class="description">${groupDescription}</textarea>
                        </div>
                        ` : ""}
                        
                        ${permMembers ? `<div class="stockSelector"></div>` : ""}
                        
                        ${permMembers || permName || permDesc ? `
                        <div class="pair submit">
                            <div class="info"></div>
                            <button class="submit">${getTranslatedStr("stockgroups.modify.submit_edit")}</button>
                        </div>` : ""}
                        ${dangerZoneVisible ? `
                            <div class="dangerZone">
                                <h3 class="warning">${getTranslatedStr("stockgroups.modify.danger.title")}</h3>
                                <p class="warning">${getTranslatedStr("stockgroups.modify.danger.subtitle")}</p>
                                ${permDelete ? `
                                    <div class="pair">
                                        <p>${getTranslatedStr("stockgroups.modify.danger.delete")}</p>
                                        <button class="delete">${getTranslatedStr("stockgroups.modify.danger.delete_button")}</button>                        
                                    </div>
                                ` : ""}
                            </div>` : ""}
                        `

        const id = createModal(html)
        const modal = document.getElementById(id);

        if (permDelete) {
            const deleteBtn = modal.querySelector("button.delete")
            deleteBtn.addEventListener("click", () => showRepeatPhraseModal(groupName, () => {
                fetch(`/api/stockgroups/${groupid}`, {
                    method: "DELETE"
                }).then(r => {
                    if (r.ok) {
                        closeModal(id)
                        window.history.pushState(null, null, `${window.location.origin}/groups`);
                        router()
                    } else {
                        console.error(`Something went wrong! 
                                Code: ${r.status}
                                MSG: ${r.statusText}`)
                    }
                });
            },  "stock_group_delete"))
        }

        if (permName || permDesc || permMembers) {
            const infotxt = modal.querySelector(".info")
            const name = modal.querySelector(`.name`)
            const description = modal.querySelector(`.description`)
            const stockSelector = new stockSelectorElement()

            if (permMembers) {
                stockSelector.setStocks(groupMembers)
                modal.querySelector(`div.stockSelector`).append(stockSelector)
            }

            if (permDesc) {
                description.style.height = "1px"
                description.style.height = description.scrollHeight + "px"


                description.addEventListener("input", () => {
                    description.style.height = "1px"
                    description.style.height = description.scrollHeight + "px"
                })

            }

            const setErr = createSetErr(infotxt)

            const validate = () => {
                if (permName && name.value.length > 32) {
                    setErr(getTranslatedStr("stockgroups.modify.err_name_too_long", {min: 2, max: 32}))
                    return false
                }
                if (permName && name.value.length < 2) {
                    setErr(getTranslatedStr("stockgroups.modify.err_name_too_short", {min: 2, max: 32}))
                    return false
                }

                infotxt.innerHTML = getTranslatedStr("stockgroups.modify.values_okay")
                infotxt.classList.add("positive")
                infotxt.classList.remove("negative")
                return true
            }

            modal.querySelectorAll(`.pair input`).forEach(elem => {
                elem.addEventListener("input", () => validate())
            })

            modal.querySelector("button.submit").addEventListener("click", () => {
                if (validate()) {
                    let added = [], removed = []
                    if (permMembers) {
                        removed = groupMembers.map(x => x)

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
                    }
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
        }
    })
}

function showModalEditAnonymousStockGroup(creating = false, initialStocks = []) {
    const locMembers = creating ? initialStocks : anonymousStockGroupMembers

    fetch(`/api/stockgroups/anonymous?members=${locMembers}`).then(r => r.json()).then(resp => {
        const groupMembers = resp["Data"]["Members"] !== null ? resp["Data"]["Members"].map(stock => Number(stock["ID"])) : []
        let html = `<h2>${creating ? getTranslatedStr("stockgroups.modify.title_create_anonymous") : getTranslatedStr("stockgroups.modify.title_edit_anonymous")}</h2>
                        
                        <div class="stockSelector"></div>
                      
                        <div class="pair submit">
                            <div class="info"></div>
                            <button class="submit">${getTranslatedStr("stockgroups.modify.submit_edit")}</button>
                        </div>
                        `

        const id = createModal(html)

        const modal = document.getElementById(id);
        const stockSelector = new stockSelectorElement()
        if (locMembers.length !== 0) {
            stockSelector.setStocks(groupMembers)
        }
        modal.querySelector(`div.stockSelector`).append(stockSelector)

        modal.querySelector("button.submit").addEventListener("click", () => {
            window.history.pushState(null, null, `${window.location.origin}/groups/anonymous?members=${Array.from(stockSelector.savedStocks).toString()}`);
            closeModal(id)
            buildAnonymousStockGroupPage(Array.from(stockSelector.savedStocks))
        })
    })
}
