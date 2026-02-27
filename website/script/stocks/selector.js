class stockSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<ul class="inner">
                <div class="titlebar">
                    <div><input type="text" class="search" placeholder="Search stocks..."></div>
                    <h3>Stock selection</h3>
                    <div></div>
                </div>
                <li>Loading stocks...</li>
            </ul>`

        this.dropdownid = createDropdown(`Please type to search...`)

        this.search = this.querySelector("input.search")
        this.dropdown = document.getElementById(this.dropdownid)
        this.inner = this.querySelector("ul.inner")
        this.savedStocks = new Set()

        this.search.popovertarget = this.dropdownid
        this.search.style.anchorName = `--anchor-${this.dropdownid}`
        this.search.addEventListener("click", () => {
            this.dropdown.togglePopover()
        })

        this.dropdown.style.width = "calc(32ch -  1rem)"

        fetch("/api/stocks").then(r => r.json()).then(resp => {
            const data = resp["Data"]
            const idNameMap = new Map(data.map((stock) => [stock["ID"], stock["Name"]]));
            const removeStock = id => {
                this.savedStocks.delete(id)
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
                this.inner.append(elem)

                const removeBtn = elem.querySelector(".removeStockBtn")
                removeBtn.addEventListener("click", event => {
                    removeStock(id)
                })
                this.savedStocks.add(id)
            }

            this.search.addEventListener("input", e => {
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
                this.dropdown.innerHTML = html
                this.dropdown.querySelectorAll(".searchResult").forEach(elem => {
                    elem.addEventListener("click", ev => {
                        addStock(ev.target.dataset.stockId)
                    })
                })
            })
        })

    }
}

customElements.define('stock-selector', stockSelectorElement);
