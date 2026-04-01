class stocklistEdit extends HTMLElement {
    connectedCallback() {
        this.timeframe = 1
        this.innerHTML = `<div class="inner">
                <h2>${getTranslatedStr("stocks.list.all_stocks")}</h2>
                <p>${getTranslatedStr("stocks.list.loading")}</p>
            </div>`
        this.closeSubscription = subscribeToAPI(`/api/stocks/sse/`, addThisToFunctionCall(this.updateData, this))
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        let html = ""
        data.forEach(e => {
            const shortPrice = getShortNumber(e["Price"]/100)
            html += `
                <div class="containing" onclick="showEditStockModal(${e["ID"]})" data-stock-id="${e["ID"]}">
                    <div class="shorthand ${Number(e["Color"]) === -1 ? "" : "colored"}" style="background-color: #${getHexColor(Number(e["Color"]))}">${sanitiseText(e["Shorthand"]).toUpperCase()}</div>
                    <div class="name">${sanitiseText(e["Name"])}</div>
                    <div class="value">${shortPrice}</div>
                </div>`
        })

        that.innerHTML = `<div class="inner">
                        <div class="titlebar">
                            <div></div>
                            <h2>${getTranslatedStr("stocks.list.all_stocks")}</h2>
                            <div></div>
                        </div>
                        <div class="contentTable grid-1-name-1">
                            ${html}
                        </div>
                    </div>
                `
    }
}



customElements.define('stock-list-edit', stocklistEdit);
