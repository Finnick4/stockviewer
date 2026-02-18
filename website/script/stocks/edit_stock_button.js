
class editStockButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.stockid = this.getAttribute("data-stockid")

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

        let html = `<h2>Edit ${stockName}</h2>
                        <div class="pair">
                            <h3>Name</h3>
                            <input class="name" type="text" placeholder="Stock name..." value="${sanitiseText(stockName)}">
                        </div>
                        <div class="pair">
                            <h3>Price (ct)</h3>
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
        const price = modal.querySelector(`.price`)

        userInformation.writePermission("canEditStockNames", perm => {
            console.log(perm)
            if (perm !== 1) {
                name.readOnly = true
            }
        })
        userInformation.writePermission("canEditStockPrices", perm => {
            console.log(perm)
            if (perm !== 1) {
                price.readOnly = true
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
                        name: name.value !== stockName ? name.value : "",
                        price: Number(price.value) !== stockPrice ? Number(price.value) : 0
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