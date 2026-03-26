class stockGroupsList extends HTMLElement {
    connectedCallback() {
        this.stockId = this.dataset.stockId
        this.innerHTML = `<div class="inner">
                <nav><h2>Stock group memberships</h2></nav>
                <p>Loading stock groups...</p>
            </div>`
        this.closeSubscription = subscribeToAPI(`/api/stocks/${this.stockId}/groups/sse`, addThisToFunctionCall(this.updateData, this))
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        if (data === null) {
            that.innerHTML = `<div class="inner">
                <nav><h2>Stock groups memberships</h2></nav>
                <p>This stock isn't a part of any stock groups...</p>
            </div>`
            return
        }
        let html = ""
        data.forEach(e => {
            html += `<li class="stockOverview"  data-stock-group-id="${e["ID"]}">
                            <a class="containing" is="a-button" href="/groups/${e["ID"]}">
                                <div class="stockName">${sanitiseText(e["Name"])}</div>
                                <div class="info">
                                    <div class="change">${getShortNumber(e["TotalValue"]/100)}</div>
                                    <div class="change">${e["MemberCount"]} other</div>
                                </div>
                            </a>
                        </li>`
        })

        that.innerHTML = `<ul class="inner">
                        <div class="titlebar">
                            <nav></nav>
                            <h2>Stock groups memberships</h2>
                            <div></div>
                        </div>
                        ${html}
                    </ul>
                `
    }
}



customElements.define('stock-groups-list', stockGroupsList);
