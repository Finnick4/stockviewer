class stocklistAll extends HTMLElement {
    connectedCallback() {
        try {
            fetch(`${window.location.origin}/api/stocks/deltas`).then(resp => resp.json()).then(obj => {
                let html = ""
                obj["Deltas"].forEach(e => {
                    let shortPrice = (e["Price2"]/100).toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                        notation: 'compact',
                        compactDisplay: 'short'
                    });
                    html += `<div class="stockoverview">
                            <div class="stockname">${e["Name"]}</div>
                            <div class="${e["DeltaAmount"] >= 0 ? "positive" : "negative"}">
                                <div class="change">${shortPrice}</div>
                                <div class="change">${e["DeltaAmount"]}</div>
                                <div class="change">${(e["Price2"]/e["Price1"] - 1.0).toFixed(2)}%</div>
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
