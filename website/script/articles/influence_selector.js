class stockInfluenceSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
                <div class="pair">
                    <p>${getTranslatedStr("articles.influence_selector.title")}</p>
                    <input type="text" class="search" placeholder="${getTranslatedStr("stocks.search_placeholder")}">
                </div>
                <div class="contentTable grid-influence-stock-selector">
                    <p class="placeholder grid-full-width">${getTranslatedStr("articles.influence_selector.no_influences")}</p>
                </div>`

        this.readOnly = false

        this.dropdownid = createDropdown(getTranslatedStr("stocks.search_empty_query"))

        const search = this.querySelector("input.search")
        const dropdown = document.getElementById(this.dropdownid)
        const inner = this.querySelector("div.contentTable")
        this.savedStocks = new Set()

        search.popovertarget = this.dropdownid
        search.style.anchorName = `--anchor-${this.dropdownid}`
        search.addEventListener("click", () => {
            dropdown.togglePopover()
        })

        dropdown.style.width = "calc(32ch -  1rem)"

        fetch("/api/stocks").then(r => r.json()).then(resp => {
            const data = resp["Data"]
            const idNameMap = new Map(data.map((stock) => [stock["ID"], stock["Name"]]));

            const addStock = id => {
                if (this.savedStocks.has(Number(id)) || this.readOnly) {
                    return
                }
                const elem = document.createElement("div")
                elem.classList.add("containing")
                elem.dataset.stockId = id
                const name = sanitiseText(idNameMap.get(Number(id)))
                elem.innerHTML = `
                        <div class="name">${sanitiseText(name)}</div>
                        <edit-influence data-stock-price="${resp["Data"].find(stock => Number(stock["ID"]) === Number(id))["Price"]}"></edit-influence>
                        <div>
                            <span class="closeBtn removeStockBtn">&minus;</span>
                        </div>
                    </div>`
                elem.querySelector("edit-influence").onEdit = () => {
                    this.onEdit()
                }
                inner.append(elem)
                const placeholder = inner.querySelector(`p.placeholder`)
                if (placeholder !== null) {
                    inner.removeChild(placeholder)
                }

                const removeBtn = elem.querySelector(".removeStockBtn")
                removeBtn.addEventListener("click", () => {
                    this.removeStock(id)
                })
                this.savedStocks.add(Number(id))
                this.onEdit()
            }

            search.addEventListener("input", e => {
                let possible = []
                for (const stock of data) {
                    if (possible.length >= 5) {
                        break
                    }
                    if (stock["Name"].toLowerCase().includes(e.target.value.toLowerCase()) || stock["Shorthand"].toLowerCase().includes(e.target.value.toLowerCase()) || (!isNaN(e.target.value) && String(stock["ID"]).includes(String(e.target.value)))) {
                        possible.push(stock)
                    }
                }
                let html = ""
                possible.forEach(stock => {
                    html += `<button class="searchResult ${this.readOnly ? "disabled" : ""}" data-stock-id="${stock["ID"]}">${sanitiseText(stock["Name"])}</button>`
                })
                if (possible.length === 0) {
                    html = getTranslatedStr("stocks.search_empty_result")
                }
                dropdown.innerHTML = html
                dropdown.querySelectorAll(".searchResult").forEach(elem => {
                    elem.addEventListener("click", ev => {
                        addStock(ev.target.dataset.stockId)
                    })
                })
            })
        })

    }
    removeStock(id) {
        if (this.readOnly) {
            return
        }
        this.savedStocks.delete(Number(id))
        const inner = this.querySelector("div.contentTable")
        inner.removeChild(inner.querySelector(`div.containing[data-stock-id="${id}"]`))
        if (inner.querySelectorAll("div.containing").length === 0) {
            const placeholder = document.createElement("p")
            placeholder.className = "placeholder"
            placeholder.className = "grid-full-width"
            placeholder.innerHTML = getTranslatedStr("articles.influence_selector.no_influences")
            inner.append(placeholder)
        }
    }
    onEdit() {
        return
    }
    setInfluences(influences) {
        this.savedStocks = new Set()
        const inner = this.querySelector("div.contentTable")

        if (influences.length === 0) {
            inner.innerHTML = `<p class="placeholder grid-full-width">${getTranslatedStr("articles.influence_selector.no_influences")}</p>`
            this.onEdit()
            return
        }
        const influenceStockIDs = influences.map(infl => infl.StockID)

        fetch(`/api/stockgroups/?members=${influenceStockIDs}`).then(r => r.json()).then(resp => {
            inner.innerHTML = ""
            influences.forEach(influence => {
                const elem = document.createElement("div")
                elem.classList.add("containing")
                elem.dataset.stockId = influence.StockID
                elem.innerHTML = `
                        <div class="name">${sanitiseText(influence.StockName)}</div>
                        <edit-influence data-stock-price="${resp["Data"]["Members"].find(stock => Number(stock["ID"]) === Number(influence.StockID))["Price"]}"  data-permil="${influence.PermillePerDay}" data-minutes="${influence.LengthMinutes}" data-falloff-type="${influence.FalloffType}"></edit-influence>
                        <div>
                            <span class="closeBtn removeStockBtn">&minus;</span>
                        </div>
                    </div>`
                elem.querySelector("edit-influence").onEdit = () => {
                    this.onEdit()
                }
                const removeBtn = elem.querySelector(".removeStockBtn")
                removeBtn.addEventListener("click", () => {
                    this.removeStock(influence.StockID)
                })
                this.savedStocks.add(Number(influence.StockID))

                inner.append(elem)
            })

            this.onEdit()
        })
    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}

customElements.define('stock-influence-selector', stockInfluenceSelectorElement);
