class stocklistArchived extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stocks.archived_list.title")}</h2></nav>
                <p>${getTranslatedStr("stocks.archived_list.loading")}</p>
            </div>`

        fetch(`/api/stocks/archived`).then(r => r.json()).then(resp => {
            const data = resp.Data
            let html = ""
            data.forEach(e => {
                const shortPrice = getShortNumber(e["Price"]/100)
                html += `
                            <div class="containing" onclick="showEditStockModal(${e["ID"]}, true)" data-stock-id="${e["ID"]}">
                                <div class="shorthand ${Number(e["Color"]) === -1 ? "" : "colored"} ${shouldUseDarkText(getHexColor(Number(e["Color"]))) ? "dark" : "light"}" style="background-color: #${getHexColor(Number(e["Color"]))}">${sanitiseText(e["Shorthand"]).toUpperCase()}</div>
                                <div class="name">${sanitiseText(e["Name"])}</div>
                                <div class="value">${shortPrice}</div>
                            </div>`
            })
            if (html === "") {
                html = `
                <p class="grid-full-width">${getTranslatedStr("stocks.archived_list.none")}</p>
                `
            }

            this.innerHTML = `<div class="inner">
                        <div class="titlebar">
                            <nav></nav>
                            <h2>${getTranslatedStr("stocks.archived_list.title")}</h2>
                            <div></div>
                        </div>
                        <div class="contentTable grid-1-name-1">
                            ${html}
                        </div>
                    </div>
                `
        })
    }
}



customElements.define('stock-list-archived', stocklistArchived);
