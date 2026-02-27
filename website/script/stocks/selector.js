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

        this.search.popovertarget = this.dropdownid
        this.search.style.anchorName = `--anchor-${this.dropdownid}`
        this.search.addEventListener("click", () => {
            this.dropdown.togglePopover()
        })

        this.dropdown.style.width = "calc(32ch -  1rem)"

        fetch("/api/stocks").then(r => r.json()).then(resp => {
            const data = resp["Data"]

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
                console.log(e.target.value)
                console.log(possible)
                let html = ""
                possible.forEach(stock => {
                    html += `<button class="searchResult" data-stock-id="${stock["ID"]}">${sanitiseText(stock["Name"])}</button>`
                })
                if (possible.length === 0) {
                    html = "No stocks found"
                }
                this.dropdown.innerHTML = html
            })
        })

    }
}

customElements.define('stock-selector', stockSelectorElement);
