class stockSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
                <div class="pair">
                    <p>${getTranslatedStr("stocks.selector.stock_selection")}</p>
                    <input type="text" class="search" placeholder="${getTranslatedStr("stocks.search_placeholder")}">
                </div>
                <div class="contentTable grid-stock-selector">
                    <p class="placeholder grid-full-width">${getTranslatedStr("stocks.selector.empty_selection")}</p>
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

        dropdown.classList.add("stockSelection")

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
                        <div>
                            <span class="closeBtn removeStockBtn">&minus;</span>
                        </div>`
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
                let selectedIndex = -1
                const updateSelectedResult = () => {
                    dropdown.querySelectorAll(".searchResult").forEach((res, i) => {
                        res.classList.remove("selected")
                        if (selectedIndex === i) {
                            res.classList.add("selected")
                        }
                    })
                }
                search.addEventListener("keydown", e => {
                    if (e.key === "ArrowUp") {
                        e.preventDefault()
                        selectedIndex--
                        if (selectedIndex < 0) {
                            selectedIndex = 0
                        }
                        updateSelectedResult()
                    }
                    if (e.key === "ArrowDown") {
                        e.preventDefault()
                        selectedIndex++
                        if (selectedIndex >= possible.length) {
                            selectedIndex = possible.length - 1
                        }
                        updateSelectedResult()
                    }
                    if (e.key === "Enter") {
                        dropdown.querySelector(".searchResult.selected")?.click()
                    }
                    if (e.key === "Escape") {
                        if (selectedIndex !== -1) {
                            e.preventDefault()
                            selectedIndex = -1
                            updateSelectedResult()
                        } else {
                            search.blur()
                        }
                    }
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
            placeholder.innerHTML = getTranslatedStr("stocks.selector.empty_selection")
            inner.append(placeholder)
        }
    }
    setStocks(arr) {
        fetch("/api/stocks").then(r => r.json()).then(resp => {
            const data = resp["Data"]
            const idNameMap = new Map(data.map((stock) => [stock["ID"], stock["Name"]]));

            this.savedStocks = new Set()
            const inner = this.querySelector("div.contentTable")
            inner.innerHTML = ""
            arr.forEach(stockid => {
                const elem = document.createElement("div")
                elem.classList.add("containing")
                elem.dataset.stockId = stockid
                const name = sanitiseText(idNameMap.get(Number(stockid)))
                elem.innerHTML = `
                        <div class="name">${sanitiseText(name)}</div>
                        <div>
                            <span class="closeBtn removeStockBtn">&minus;</span>
                        </div>`
                inner.append(elem)

                const removeBtn = elem.querySelector(".removeStockBtn")
                removeBtn.addEventListener("click", () => {
                    this.removeStock(Number(stockid))
                })
                this.savedStocks.add(Number(stockid))
            })
        })
    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}

customElements.define('stock-selector', stockSelectorElement);
