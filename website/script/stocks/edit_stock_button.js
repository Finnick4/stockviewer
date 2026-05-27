
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


function showEditStockModal(stockID, isArchived) {
    isArchived = isArchived || isArchived === "true"

    let stockName, stockPrice, stockShorthand, stockColorHex

    const permName = userInfo.checkPerm("canEditStockNames")  && !isArchived
    const permPrice = userInfo.checkPerm("canEditStockPrices") && !isArchived
    const permColor = userInfo.checkPerm("canEditStockColors") && !isArchived

    const permArchive = userInfo.checkPerm("canArchiveStocks")
    const permDelete = userInfo.checkPerm("canDeleteStocks")
    const dangerZoneVisible = permDelete || permArchive

    let html = `<h2>${getTranslatedStr("stocks.modify.edit_title",{name: getTranslatedStr("stocks.modify.loading_name")})} <div class="shorthand">${getTranslatedStr("stocks.modify.loading_shorthand")}</div></h2>
                    ${permName ? `
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.name")}</p>
                            <input class="name" type="text" placeholder="${getTranslatedStr("stocks.modify.stock_name_placeholder")}">
                        </div>
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.shorthand")}</p>
                            <input class="shorthand" type="text" placeholder="${getTranslatedStr("stocks.modify.stock_shorthand_placeholder")}">
                        </div>
                    ` : ""}
                    ${permColor ? `
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.color")}</p>
                            <color-selector></color-selector>
                        </div>
                    ` : ""}
                    ${permPrice ? `
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.price_ct")}</p>
                            <input class="price" type="number">
                        </div>
                    ` : ""}
                    ${permPrice || permColor || permName ? `
                    <div class="pair submit">
                        <div class="info"></div>
                        <button class="submit">${getTranslatedStr("stocks.modify.submit")}</button>
                    </div> ` : ""}
                    ${dangerZoneVisible ? `
                        <div class="dangerZone">
                            <h3 class="warning">${getTranslatedStr("stocks.modify.danger.title")}</h3>
                            <p class="warning">${getTranslatedStr("stocks.modify.danger.subtitle")}</p>
                            ${permArchive ? `
                                <div class="pair">
                                    <p>${getTranslatedStr(isArchived ? "stocks.modify.danger.unarchive" : "stocks.modify.danger.archive")}</p>
                                    <button class="archive">${getTranslatedStr(isArchived ? "stocks.modify.danger.unarchive_button" : "stocks.modify.danger.archive_button")}</button>                        
                                </div>
                            ` : ""}
                            ${permDelete ? `
                                <div class="pair">
                                    <p>${getTranslatedStr("stocks.modify.danger.delete")}</p>
                                    <button class="delete">${getTranslatedStr("stocks.modify.danger.delete_button")}</button>
                                </div>
                            ` : ""}
                        </div>` : ""}
                           
                  `
    const id = createModal(html)
    const modal = document.getElementById(id)

    const infotxt = modal.querySelector(".info")
    const header = modal.querySelector(`h2`)
    const name = modal.querySelector(`.name`)
    const shorthand = modal.querySelector(`input.shorthand`)
    const color = modal.querySelector(`color-selector`)
    const price = modal.querySelector(`.price`)

    if (permDelete) {
        const deleteBtn = modal.querySelector("button.delete")
        deleteBtn.addEventListener("click", () => showAuthenticatePromptModal(password => new Promise((resolve, reject) => {
            fetch(`/api/stocks/${stockID}`, {
                method: "DELETE",
                body: JSON.stringify({
                    password: password
                })
            }).then(r => {
                if (r.ok) {
                    console.log("Okay!")
                    closeModal(id)
                    window.history.pushState(null, null, `${window.location.origin}/stocks`);
                    router()
                    closeUnneededSubscriptions()
                    resolve()

                } else {
                    reject()
                }
            })
        }), "stocks_delete"))
    }
    if (permArchive) {
        const archiveBtn = modal.querySelector("button.archive")
        archiveBtn.addEventListener("click", () => showRepeatPhraseModal(stockName, () => {
                fetch(`/api/stocks/${stockID}/archive`, {
                    method: "PUT",
                    body: JSON.stringify({
                        result: !isArchived
                    })
                }).then(r => {
                    if (r.ok) {
                        closeModal(id)
                        window.history.pushState(null, null, `${window.location.origin}/stocks${isArchived ? `/${stockID}` : ""}`);
                        router()
                    } else {
                        console.error(`Something went wrong! 
                            Code: ${r.status}
                            MSG: ${r.statusText}`)
                    }
                });
            }, isArchived ? "stocks_unarchive" : "stocks_archive"))
    }

    loadStockData(stockID, data => {
        stockName = sanitiseText(data.Name)
        stockPrice = sanitiseText(data.Price)
        stockShorthand = sanitiseText(data.Shorthand).toUpperCase()
        stockColorHex = Number(data.Color).toString(16)
        header.innerHTML = `${getTranslatedStr("stocks.modify.edit_title",{name: stockName})} <div class="shorthand ${stockColorHex === "-1" ? "" : "colored"} ${shouldUseDarkText(getHexColor(stockColorHex)) ? "dark" : "light"}" style="background-color: #${getHexColor(stockColorHex)}">${stockShorthand}</div>`
        if (permName) {
            name.value = stockName
            shorthand.value = stockShorthand
        }
        if (permPrice) {
            price.value = stockPrice
        }
        if (permColor) {
            color.setColor(stockColorHex)
        }
    })

    if (permName || permPrice || permColor) {
        const setErr = createSetErr(infotxt)

        const validate = () => {

            if (permName && name.value.length > 32) {
                setErr(getTranslatedStr("stocks.modify.err_name_too_long", {min: 2, max: 32}))
                return false
            }
            if (permName && name.value.length < 2) {
                setErr(getTranslatedStr("stocks.modify.err_name_too_short", {min: 2, max: 32}))
                return false
            }

            if (permName && shorthand.value.length > 5) {
                setErr(getTranslatedStr("stocks.modify.err_shorthand_too_long", {min: 2, max: 5}))
                return false
            }
            if (permName && shorthand.value.length < 2) {
                setErr(getTranslatedStr("stocks.modify.err_shorthand_too_short", {min: 2, max: 5}))
                return false
            }
            if (permName && !isNaN(shorthand.value)) {
                setErr(getTranslatedStr("stocks.modify.err_shorthand_numeric"))
                return false
            }

            if (permPrice && price.value < 2) {
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

        modal.querySelector(`button.submit`).addEventListener("click", () => {
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
    }
}