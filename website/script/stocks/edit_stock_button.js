
class editStockButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.stockid = this.dataset.stockId

        this.classList.add("edit")

        this.title = getTranslatedStr("stocks.modify.edit_icon_alt_text")
        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="${getTranslatedStr("stocks.modify.edit_icon_alt_text")}" draggable="false">`

        this.onclick = () => showEditStockModal(this.stockid)
    }

}

customElements.define('edit-stock-button', editStockButtonElement, {extends: "button"});


function showEditStockModal(stockID) {
    fetch(`/api/stocks/${stockID}`).then(r => r.json()).then(resp => {
        const stockName = sanitiseText(resp["Data"]["Name"])
        const stockPrice = sanitiseText(resp["Data"]["Price"])
        const stockShorthand = sanitiseText(resp["Data"]["Shorthand"]).toUpperCase()
        const stockColorHex = Number(resp["Data"]["Color"]).toString(16)

        let html = `<h2>${getTranslatedStr("stocks.modify.edit_title",{name: stockName})} <div class="shorthand ${stockColorHex === "-1" ? "" : "colored"}" style="background-color: #${getHexColor(stockColorHex)}">${stockShorthand}</div></h2>
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.name")}</p>
                            <input class="name" type="text" placeholder="${getTranslatedStr("stocks.modify.stock_name_placeholder")}" value="${sanitiseText(stockName)}">
                        </div>
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.shorthand")}</p>
                            <input class="shorthand" type="text" placeholder="${getTranslatedStr("stocks.modify.stock_shorthand_placeholder")}" value="${sanitiseText(stockShorthand)}">
                        </div>
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.color")}</p>
                            <color-selector data-color="${stockColorHex}"></color-selector>
                        </div>
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.price_ct")}</p>
                            <input class="price" type="number" value="${sanitiseText(stockPrice)}">
                        </div>
                        <div class="pair">
                            <div class="info"></div>
                            <button class="submit">${getTranslatedStr("stocks.modify.submit")}</button>
                        </div>
                      `
        const id = createModal(html)
        const modal = document.getElementById(id)

        const infotxt = modal.querySelector(".info")
        const name = modal.querySelector(`.name`)
        const shorthand = modal.querySelector(`input.shorthand`)
        const color = modal.querySelector(`color-selector`)
        const price = modal.querySelector(`.price`)

        let permName = false, permPrice = false, permColor = false

        if (!userInfo.checkPerm("canEditStockNames")) {
            name.readOnly = true
        } else {
            permName = true
        }

        if (!userInfo.checkPerm("canEditStockPrices")) {
            price.readOnly = true
        } else {
            permPrice = true
        }

        if (!userInfo.checkPerm("canEditStockColors")) {
            color.readOnly = true
        } else {
            permColor = true
        }

        const setErr = createSetErr(infotxt)

        const validate = () => {

            if (name.value.length > 32) {
                setErr(getTranslatedStr("stocks.modify.err_name_too_long", {min: 2, max: 32}))
                return false
            }
            if (name.value.length < 2) {
                setErr(getTranslatedStr("stocks.modify.err_name_too_short", {min: 2, max: 32}))
                return false
            }

            if (shorthand.value.length > 5) {
                setErr(getTranslatedStr("stocks.modify.err_shorthand_too_long", {min: 2, max: 5}))
                return false
            }
            if (shorthand.value.length < 2) {
                setErr(getTranslatedStr("stocks.modify.err_shorthand_too_short", {min: 2, max: 5}))
                return false
            }
            if (!isNaN(shorthand.value)) {
                setErr(getTranslatedStr("stocks.modify.err_shorthand_numeric"))
                return false
            }

            if (price.value < 2) {
                setErr(getTranslatedStr("stocks.modify.err_price_too_low", {price: "0.02€"}))
                return false
            }

            infotxt.innerHTML = getTranslatedStr("stocks.modify.values_okay")
            infotxt.classList.add("positive")
            infotxt.classList.remove("negative")
            return true
        }

        modal.querySelectorAll(`.pair input`).forEach(elem => {
            elem.addEventListener("input", () => validate())
        })

        modal.querySelector(`.submit`).addEventListener("click", () => {
            if (validate()) {
                fetch(`${window.location.origin}/api/stocks/${stockID}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        name: permName && name.value !== stockName ? name.value : "",
                        price: permPrice && Number(price.value) !== stockPrice ? Number(price.value) : 0,
                        color: permColor && color.color !== stockColorHex ? Number(parseInt(color.color, 16)) : 0,
                        shorthand: permName && shorthand.value !== stockShorthand ? shorthand.value : ""
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