
class editStockButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.stockid = this.dataset.stockId

        this.classList.add("edit")

        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="edit" draggable="false">`

        this.onclick = () => showEditStockModal(this.stockid)
    }

}

customElements.define('edit-stock-button', editStockButtonElement, {extends: "button"});


function showEditStockModal(stockID) {
    fetch(`/api/stocks?id=${stockID}`).then(r => r.json()).then(resp => {
        const stockName = sanitiseText(resp["Data"]["Name"])
        const stockPrice = sanitiseText(resp["Data"]["Price"])
        const stockShorthand = sanitiseText(resp["Data"]["Shorthand"]).toUpperCase()

        let html = `<h2>Edit ${stockName}</h2>
                        <div class="pair">
                            <p>Name</p>
                            <input class="name" type="text" placeholder="Stock name..." value="${sanitiseText(stockName)}">
                        </div>
                        <div class="pair">
                            <p>Shorthand</p>
                            <input class="shorthand" type="text" placeholder="Shorthand..." value="${sanitiseText(stockShorthand)}">
                        </div>
                        <div class="pair">
                            <p>Price (ct)</p>
                            <input class="price" type="number" value="${sanitiseText(stockPrice)}">
                        </div>
                        <div class="pair">
                            <div class="info"></div>
                            <button class="submit">Submit</button>
                        </div>
                      `
        const id = createModal(html)
        const modal = document.getElementById(id)

        const infotxt = modal.querySelector(".info")
        const name = modal.querySelector(`.name`)
        const shorthand = modal.querySelector(`.shorthand`)
        const price = modal.querySelector(`.price`)

        let permName = false, permPrice = false

        userInformation.writePermission("canEditStockNames", perm => {
            console.log(perm)
            if (perm !== 1) {
                name.readOnly = true
            } else {
                permName = true
            }
        })
        userInformation.writePermission("canEditStockPrices", perm => {
            console.log(perm)
            if (perm !== 1) {
                price.readOnly = true
            } else {
                permPrice = true
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
            if (name.value.length < 2) {
                seterr("The name is too short! (2 - 32 characters)")
                return false
            }

            if (shorthand.value.length > 5) {
                seterr("The shorthand is too long! (2 - 5 characters)")
                return false
            }
            if (shorthand.value.length < 2) {
                seterr("The shorthand is too short! (2 - 5 characters)")
                return false
            }
            if (!isNaN(shorthand.value)) {
                seterr("The shorthand may not be a number!")
                return false
            }

            if (price.value < 2) {
                seterr("The price has to be at least 0.02€!")
                return false
            }

            infotxt.innerHTML = "Values are okay"
            infotxt.classList.add("positive")
            infotxt.classList.remove("negative")
            return true
        }

        modal.querySelectorAll(`.pair input`).forEach(elem => {
            elem.addEventListener("input", () => validate())
        })

        modal.querySelector(`.submit`).addEventListener("click", () => {
            if (validate()) {
                fetch(`${window.location.origin}/api/stocks`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        id: Number(stockID),
                        name: permName && name.value !== stockName ? name.value : "",
                        price: permPrice && Number(price.value) !== stockPrice ? Number(price.value) : 0,
                        shorthand: permName && shorthand.value !== stockShorthand ? stockShorthand : ""
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