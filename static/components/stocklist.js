class stocklistAll extends HTMLElement {
    connectedCallback() {
        try {
            fetch(`${window.location.origin}/api/stocks/?Timeframe=1`).then(resp => resp.json()).then(obj => {
                let html = ""
                obj["Data"].forEach(e => {
                    let shortPrice = (e["Price2"]/100).toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                        notation: 'compact',
                        compactDisplay: 'short'
                    });
                    html += `<a class="stockoverview" data-stock-id="${e["ID"]}" href="${window.location.origin}/stocks/${e["ID"]}">
                            <div class="stockname">${e["Name"]}</div>
                            <div class="${e["DeltaAmount"] >= 0 ? "positive" : "negative"}">
                                <div class="change">${shortPrice}</div>
                                <div class="change">${e["DeltaAmount"] / 100}€</div>
                                <div class="change">${(e["Price2"]/e["Price1"] - 1.0).toFixed(2)}%</div>
                            </div>
                        </a>`
                })

                this.innerHTML = `<div class="stocklist">
                        <h2>All stocks</h2>
                        ${html}
                    </div>
                `
                document.querySelectorAll(".stockoverview").forEach(elem => {
                    elem.addEventListener("click", e => {
                        const currentID = e.currentTarget.getAttribute("data-stock-id")
                        window.history.pushState(null, null, `${window.location.origin}/stocks/${currentID}`)
                        e.preventDefault()
                    })})
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
