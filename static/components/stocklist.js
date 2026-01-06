class stocklistAll extends HTMLElement {
    connectedCallback() {
        try {
            fetch(`${window.location.origin}/api/stocks`).then(resp => resp.json()).then(obj => {
                let html = ""
                obj["Data"].forEach(e => {
                    html += `<div class="stockoverview">
                            <div class="stockname">${e["Name"]}</div>
                            <div>
                                <div class="change positive">200.63m</div>
                                <div class="change positive">+10</div>
                                <div class="change positive">+1%</div>
                            </div>
                        </div>`
                })

                this.innerHTML = `<div class="stocklist">
                        <h2>All stocks</h2>
                        ${html}
                    </div>
                `
            })
        } catch (e) {
            console.log(e)
            this.innerHTML = `<div class="stocklist">
                    <h2>All stocks</h2>
                    <p>Failed to get stocks!</p>
                </div>`
        }

        this.innerHTML = `<div class="stocklist">
                <h2>All stocks</h2>
                <p>Loading stock data...</p>
            </div>`
    }
}

customElements.define('stocklist-all', stocklistAll);
