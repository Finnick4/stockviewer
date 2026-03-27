
class editStockGroupButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.groupid = Number(this.dataset.stockGroupId)

        this.classList.add("edit")

        this.onclick = () => showModalEditStockGroup(this.groupid)

        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="edit" draggable="false">`
    }

}

customElements.define('edit-stock-group-button', editStockGroupButtonElement, {extends: "button"});


function showModalEditStockGroup(groupid) {
    fetch(`/api/stockgroups/${groupid}`).then(r => r.json()).then(resp => {
        const groupName = sanitiseText(resp["Data"]["Name"])
        const groupDescription = sanitiseText(resp["Data"]["Description"])
        const groupMembers = resp["Data"]["Members"].map(stock => Number(stock["ID"]))
        console.log(groupMembers)

        let html = `<h2>Edit ${sanitiseText(groupName)}</h2>
                        <div class="pair">
                            <p>Name</p>
                            <input class="name" type="text" placeholder="Group name..." value="${sanitiseText(groupName)}">
                        </div>
                        <div class="textField">
                            <p>Description</p>
                            <textarea class="description">${groupDescription}</textarea>
                        </div>
                        <div class="stockSelector"></div>
                      
                        <div class="pair">
                            <div class="info"></div>
                            <button class="submit">Submit</button>
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

        userInformation.writePermission("canEditStockGroupNames", perm => {
            if (perm !== 1) {
                name.readOnly = true
            } else {
                permName = true
            }
        })
        userInformation.writePermission("canEditStockGroupDescriptions", perm => {
            if (perm !== 1) {
                description.readOnly = true
            } else {
                permDesc = true
            }
        })
        userInformation.writePermission("canEditStockGroupMembers", perm => {
            if (perm !== 1) {
                stockSelector.readOnly = true
            } else {
                permMembers = true
            }
        })

        const seterr = err => {
            infotxt.innerHTML = err
            infotxt.classList.add("negative")
            infotxt.classList.remove("positive")
        }

        const validate = () => {
            if (name.value.length > 32) {
                seterr("The name is too long! (2 - 32 characters)")
                return false
            }
            if (name.value.length <= 2) {
                seterr("The name is too short! (2 - 32 characters)")
                return false
            }

            infotxt.innerHTML = "Values are okay"
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

        modal.querySelector(".submit").addEventListener("click", () => {
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
                console.log({
                    ID: Number(groupid),
                    Name: permName && name.value !== groupName ? name.value : "",
                    Description: permDesc && description.value !== groupDescription ? description.value : "",
                    AddedMembers: permMembers && added.length !== 0 ? added : [],
                    RemovedMembers: permMembers && removed.length !== 0 ? removed : []
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
