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
        this.search = this.querySelector("input.search")
        this.search.addEventListener("input", e => {
            console.log(this.search.value)
        })
        fetch("/api/stocks").then(r => r.json()).then(resp => {
            const data = resp["Data"]

            this.search.addEventListener("input", e => {
                let possible = []
                data.forEach(stock =>  {
                    if (stock["Name"].toLowerCase().startsWith(e.target.value.toLowerCase())) {
                        possible.push(stock)
                    }
                })
                console.log(e.target.value)
                console.log(possible)
            })
        })

    }
}

customElements.define('stock-selector', stockSelectorElement);
