
class searchBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<input type="text" placeholder="${getTranslatedStr("header.search.placeholder")}">`

        this.dropdownid = createDropdown(getTranslatedStr("header.search.empty_query"))

        const search = this.querySelector("input")
        const dropdown = document.getElementById(this.dropdownid)

        search.popovertarget = this.dropdownid
        this.style.anchorName = `--anchor-${this.dropdownid}`
        search.addEventListener("click", () => {
            dropdown.togglePopover(true)
        })
        search.addEventListener("focus", () => {
            dropdown.togglePopover(true)
        })
        this.updateSearchDropdownWidth = () => {
            dropdown.style.width = `calc(${search.offsetWidth}px - 1rem)`
        }
        this.updateSearchDropdownWidth()

        loadStocksData(() => {})

        fetch("/api/stockgroups").then(r => r.json()).then(resp => {
            const stockGroupData = resp.Data

            search.addEventListener("input", e => {
                let possibleStocks = [], possibleGroups = []

                const lowerInput = e.target.value.toLowerCase()
                const includes = compareStr => compareStr.toLowerCase().includes(lowerInput)

                if (lowerInput === "") {
                    dropdown.innerHTML = getTranslatedStr("header.search.empty_query")
                    return
                }

                for (const stock of stocksCache) {
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
                        if (selectedIndex >= possibleStocks.length + possibleGroups.length) {
                            selectedIndex = possibleStocks.length + possibleGroups.length - 1
                        }
                        updateSelectedResult()
                    }
                    if (e.key === "Enter") {
                        dropdown.querySelector(".searchResult.selected")?.click()
                        search.blur()
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
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}

customElements.define('search-bar', searchBarElement);
