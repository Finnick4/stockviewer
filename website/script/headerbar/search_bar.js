
class searchBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<input type="text" placeholder="${getTranslatedStr("header.search.placeholder")}">`

        this.dropdownid = createDropdown(getTranslatedStr("header.search.empty_query"))

        const search = this.querySelector("input")
        const dropdown = document.getElementById(this.dropdownid)

        search.popovertarget = this.dropdownid
        this.style.anchorName = `--anchor-${this.dropdownid}`
        search.addEventListener("click", () => {
            dropdown.togglePopover()
        })
        dropdown.style.width = `calc(${search.offsetWidth}px - 1rem)`

        Promise.all([
            fetch("/api/stocks"),
            fetch("/api/stockgroups")
        ]).then(results => {
            const jsonPromises = []
            results.forEach(result => jsonPromises.push(result.json()))

            Promise.all(jsonPromises).then(responses => {
                const stocksData = responses[0].Data
                const stockGroupData = responses[1].Data

                const stockIdNameMap = new Map(stocksData.map((stock) => [Number(stock["ID"]), String(stock["Name"])]));
                const groupIdNameMap = new Map(stockGroupData.map((group) => [Number(group["ID"]), String(group["Name"])]));

                search.addEventListener("input", e => {
                    let possibleStocks = [], possibleGroups = []

                    const lowerInput = e.target.value.toLowerCase()
                    const includes = compareStr => compareStr.toLowerCase().includes(lowerInput)

                    if (lowerInput === "") {
                        dropdown.innerHTML = getTranslatedStr("header.search.empty_query")
                        return
                    }

                    for (const stock of stocksData) {
                        if (possibleStocks.length >= 5) {
                            break
                        }
                        if (includes(stock["Name"]) || includes(stock["Shorthand"]) || (!isNaN(lowerInput) && includes(String(stock["ID"])))) {
                            possibleStocks.push(stock)
                        }
                    }
                    for (const group of stockGroupData) {
                        if (possibleGroups.length >= 5) {
                            break
                        }
                        if (includes(group["Name"]) || (!isNaN(lowerInput) && includes(String(group["ID"])))) {
                            possibleGroups.push(group)
                        }
                    }
                    let html = ""
                    if (possibleStocks.length > 0) {
                        html += `<p class="sectionHeader">${getTranslatedStr("header.stocks")}</p>`
                    }
                    possibleStocks.forEach(stock => {
                        html += `<a class="btn searchResult" is="a-button" href="/stocks/${stock.ID}" data-stock-id="${stock["ID"]}">${sanitiseText(stock["Name"])}</a>`
                    })

                    if (possibleGroups.length > 0) {
                        html += `<p class="sectionHeader">${getTranslatedStr("header.stock_groups")}</p>`
                    }
                    possibleGroups.forEach(group => {
                        html += `<a class="btn searchResult" is="a-button" href="/groups/${group.ID}" data-stock-group-id="${group["ID"]}">${sanitiseText(group["Name"])}</a>`
                    })

                    if (possibleStocks.length === 0 && possibleGroups.length === 0) {
                        html = getTranslatedStr("header.search.empty_result")
                    }
                    dropdown.innerHTML = html
                })
            })
        })



    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}

customElements.define('search-bar', searchBarElement);
