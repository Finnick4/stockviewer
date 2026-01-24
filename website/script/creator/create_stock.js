function showModalCreateStock(elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    let html = `<h2>Create a new stock</h2>
                        <div class="pair">
                            <h3>Name</h3>
                            <input class="name" type="text" placeholder="Stock name...">
                        </div>
                        <div class="pair">
                            <h3>Initial price (ct)</h3>
                            <input class="price" type="number">
                        </div>
                        <div class="pair">
                            <div class="info"></div>
                            <button class="submit">Submit</button>
                        </div>
                        `
    let id = createModal(html)
    document.querySelectorAll(`#${id} .pair input`).forEach(elem => {
        elem.addEventListener("input", () => validateModalCreateStock(id))
    })
    document.querySelector(`#${id} .submit`).addEventListener("click", () => sendModalCreateStock(id))
    validateModalCreateStock(id)
}

function modalCreateStockSetErrorInfo(id, msg) {
    let infotxt = document.querySelector(`#${id} .info`)
    infotxt.innerHTML = msg
    infotxt.classList.add("negative")
    infotxt.classList.remove("positive")
}

function validateModalCreateStock(id) {
    let infotxt = document.querySelector(`#${id} .info`)

    let name = document.querySelector(`#${id} .name`).value
    if (name.length > 32) {
        modalCreateStockSetErrorInfo(id, "The name is too long! (2 - 32 characters)")
        return false
    }
    if (name.length <= 2) {
        modalCreateStockSetErrorInfo(id, "The name is too short! (2 - 32 characters)")
        return false
    }


    let price = document.querySelector(`#${id} .price`).value
    if (price < 10000000) {
        modalCreateStockSetErrorInfo(id, "The initial price has to be at least 100k!")
        return false
    }

    infotxt.innerHTML = "Values are okay"
    infotxt.classList.add("positive")
    infotxt.classList.remove("negative")
    return true
}



function sendModalCreateStock(id) {
    if (validateModalCreateStock(id)) {
        fetch(`${window.location.origin}/api/stocks/?name=${document.querySelector(`#${id} .name`).value}&initPrice=${document.querySelector(`#${id} .price`).value}`, {
            method: "POST"
        }).then(r => {
            if (r.ok) {
                closeModal(id)
            } else {
                if (r.status >= 400 || r.status < 500) {
                    modalCreateStockSetErrorInfo(id, "There is an issue with the request.")
                } else {
                    modalCreateStockSetErrorInfo(id, "There is a server-side issue causing this request to not be processed!")
                }
            }
        });
    }
}
