function showModalCreateStock(elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    if (!userInfo.checkPerm("canCreateStocks")) {
        createModal(`<h2>${getTranslatedStr("stocks.modify.create_title")}</h2><p>${getTranslatedStr("stocks.modify.err_no_create_permission")}</p>`)
        return
    }

    let html = `<h2>${getTranslatedStr("stocks.modify.create_title")}</h2>
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.name")}</p>
                            <input class="name" type="text" placeholder="${getTranslatedStr("stocks.modify.stock_name_placeholder")}">
                        </div>
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.shorthand")}</p>
                            <input class="shorthand" type="text" placeholder="${getTranslatedStr("stocks.modify.stock_shorthand_placeholder")}">
                        </div>
                         <div class="pair">
                            <p>${getTranslatedStr("stocks.color")}</p>
                            <color-selector data-color="-1"></color-selector>
                        </div>
                        <div class="pair">
                            <p>${getTranslatedStr("stocks.modify.initial_price_ct")}</p>
                            <input class="price" type="number">
                        </div>
                        <div class="pair">
                            <div class="info"></div>
                            <button class="submit">${getTranslatedStr("stocks.modify.submit")}</button>
                        </div>
                        `

    const id = createModal(html)

    const modal = document.getElementById(id);
    const infotxt = modal.querySelector(".info")
    const name = modal.querySelector(`.name`)
    const shorthand = modal.querySelector(`.shorthand`)
    const color = modal.querySelector(`color-selector`)
    const price = modal.querySelector(`.price`)

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

        if (price.value < 10000000) {
            setErr(getTranslatedStr("stocks.modify.err_initial_price_too_low", {price: getShortNumber(10000000 / 100) + "€"}))
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

    modal.querySelector(".submit").addEventListener("click", () => {
        if (validate()) {
            fetch(`${window.location.origin}/api/stocks/?name=${name.value}&initPrice=${price.value}&shorthand=${shorthand.value}&color=${Number(parseInt(color.color, 16))}`, {
                method: "POST"
            }).then(r => {
                if (r.ok) {
                    closeModal(id)
                    r.json().then(resp => {
                        window.history.pushState(null, null, `${window.location.origin}/stocks/${resp["Data"]}`);
                        router(`/stocks/${resp["Data"]}`)
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

