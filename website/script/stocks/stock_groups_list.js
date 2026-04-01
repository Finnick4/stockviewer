class stockGroupsList extends HTMLElement {
    connectedCallback() {
        this.stockId = this.dataset.stockId
        this.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stocks.group_memberships.stock_group_memberships")}</h2></nav>
                <p>${getTranslatedStr("stocks.group_memberships.loading")}</p>
            </div>`
        this.closeSubscription = subscribeToAPI(`/api/stocks/${this.stockId}/groups/sse`, addThisToFunctionCall(this.updateData, this))
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        if (data === null) {
            that.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stocks.group_memberships.stock_group_memberships")}</h2></nav>
                <p>${getTranslatedStr("stocks.group_memberships.no_membership")}</p>
            </div>`
            return
        }
        let html = ""
        data.forEach(e => {
            html += `
                <a class="containing" is="a-button" href="/groups/${e["ID"]}" data-stock-group-id="${e["ID"]}">
                    <div class="name">${sanitiseText(e["Name"])}</div>
                    <div class="value">${getShortNumber(e["TotalValue"]/100)}</div>
                    <div class="value">${e["MemberCount"]} other</div>
                </a>`
        })

        that.innerHTML = `<div class="inner">
                        <div class="titlebar">
                            <nav></nav>
                            <h2>${getTranslatedStr("stocks.group_memberships.stock_group_memberships")}</h2>
                            <div></div>
                        </div>
                        <div class="contentTable grid-0-name-2">
                            ${html}
                        </div>
                    </div>
                    
                `
    }
}



customElements.define('stock-groups-list', stockGroupsList);
