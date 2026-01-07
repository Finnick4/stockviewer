class stocklistAll extends HTMLElement {
    connectedCallback() {
        try {
            fetch(`${window.location.origin}/api/stocks`).then(resp => resp.json()).then(obj => {
                let html = ""
                obj["Data"].forEach(e => {
                    let shortPrice = (e["Price"]/100).toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                        notation: 'compact',
                        compactDisplay: 'short'
                    });
                    html += `<div class="stockoverview">
                            <div class="stockname">${e["Name"]}</div>
                            <div class="positive">
                                <div class="change">${shortPrice}</div>
                                <div class="change">+10</div>
                                <div class="change">+1%</div>
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
