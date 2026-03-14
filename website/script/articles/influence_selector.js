class stockInfluenceSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
                <div class="pair">
                    <p>Stock influences</p>
                    <input type="text" class="search" placeholder="Search stocks...">
                </div>
                <ul class="inner">
                    <li class="placeholder">No influences present...</li>
                </ul>`

        this.readOnly = false

        this.dropdownid = createDropdown(`Please type to search...`)

        const search = this.querySelector("input.search")
        const dropdown = document.getElementById(this.dropdownid)
        const inner = this.querySelector("ul.inner")
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
                const elem = document.createElement("li")
                elem.classList.add("stockOverview")
                elem.dataset.stockId = id
                const name = sanitiseText(idNameMap.get(Number(id)))
                elem.innerHTML = `
                    <div class="containing">
                        <div class="stockName">${sanitiseText(name)}</div>
                        <div class="influenceInputs">
                            <div><input class="permille" type="number"> &permil;/day</div>
                            <div>for <input class="minutes" type="number"> minutes</div>
                        </div>
                        <div>
                            <span class="closeBtn removeStockBtn">&minus;</span>
                        </div>
                    </div>`
                inner.append(elem)
                const placeholder = inner.querySelector(`li.placeholder`)
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
                    html = "No stocks found"
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
        const inner = this.querySelector("ul.inner")
        inner.removeChild(inner.querySelector(`li.stockOverview[data-stock-id="${id}"]`))
        if (inner.querySelectorAll("li.stockOverview").length === 0) {
            const placeholder = document.createElement("li")
            placeholder.className = "placeholder"
            placeholder.innerHTML = "No influences present..."
            inner.append(placeholder)
        }
    }
}

customElements.define('stock-influence-selector', stockInfluenceSelectorElement);
