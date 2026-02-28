function showModalCreateStockGroup(elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    let html = `<h2>Create a new stock group</h2>
                        <div class="pair">
                            <h3>Name</h3>
                            <input class="name" type="text" placeholder="Group name...">
                        </div>
                        <div class="textField">
                            <p>Description</p>
                            <textarea class="description"></textarea>
                        </div>
                        <div class="stockSelector">
                            <p>Members</p>
                        </div>
                      
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
    modal.querySelector(`div.stockSelector`).append(stockSelector)


    userInformation.writePermission("canCreateStockGroups", perm => {
        if (perm !== 1) {
            modal.querySelector(".content").innerHTML = "<h2>Create a new stock group</h2><p>It doesn't seem like you are able to create stock groups currently!</p>"
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

