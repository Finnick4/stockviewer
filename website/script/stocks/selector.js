class stockSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<ul class="inner">
                <div class="titlebar">
                    <div><input type="text" class="search" placeholder="Search stocks..."></div>
                    <h3>Stock selection</h3>
                    <div></div>
                </div>
                <li class="placeholder">No stocks selected...</li>
            </ul>`

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
            const removeStock = id => {
                this.savedStocks.delete(id)
                inner.removeChild(inner.querySelector(`li.stockOverview[data-stock-id="${id}"]`))
                if (inner.querySelectorAll("li.stockOverview").length === 0) {
                    const placeholder = document.createElement("li")
                    placeholder.className = "placeholder"
                    placeholder.innerHTML = "No stocks selected..."
                    inner.append(placeholder)
                }
            }

            const addStock = id => {
                if (this.savedStocks.has(id)) {
                    return
                }
                const elem = document.createElement("li")
                elem.classList.add("stockOverview")
                elem.dataset.stockId = id
                const name = sanitiseText(idNameMap.get(Number(id)))
                elem.innerHTML = `
                    <div class="containing">
                        <div class="stockName">${name}</div>
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
                removeBtn.addEventListener("click", event => {
                    removeStock(id)
                })
                this.savedStocks.add(id)
            }

            search.addEventListener("input", e => {
                let possible = []
                for (const stock of data) {
                    if (possible.length >= 5) {
                        break
                    }
                    if (stock["Name"].toLowerCase().includes(e.target.value.toLowerCase())) {
                        possible.push(stock)
                    }
                }
                let html = ""
                possible.forEach(stock => {
                    html += `<button class="searchResult" data-stock-id="${stock["ID"]}">${sanitiseText(stock["Name"])}</button>`
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
}

customElements.define('stock-selector', stockSelectorElement);
