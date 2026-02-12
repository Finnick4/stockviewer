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

    const id = createModal(html)

    const modal = document.getElementById(id);
    const infotxt = modal.querySelector(".info")
    const name = modal.querySelector(`.name`)
    const price = modal.querySelector(`.price`)

    userInformation.writePermission("canCreateStocks", perm => {
        if (perm !== 1) {
            modal.querySelector(".content").innerHTML = "<h2>Create a new  stock</h2><p>It doesn't seem like you are able to create stocks currently!</p>"
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

        if (price.value < 10000000) {
            seterr("The initial price has to be at least 100k!")
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

    modal.querySelector(".submit").addEventListener("click", () => {
        if (validate()) {
            fetch(`${window.location.origin}/api/stocks/?name=${document.querySelector(`#${id} .name`).value}&initPrice=${document.querySelector(`#${id} .price`).value}`, {
                method: "POST"
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

