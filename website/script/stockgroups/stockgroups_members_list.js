class stockgroupsMembersList extends HTMLElement {
    connectedCallback() {
        this.groupid = this.dataset.stockGroupId
        this.innerHTML = `<div class="inner">
                <nav><h2>All members</h2></nav>
                <p>Loading stock data...</p>
            </div>`
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/sse/?id=${this.groupid}`, addThisToFunctionCall(this.updateData, this))
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        let html = ""
        if (data["Members"] === null) {
            that.innerHTML = `<div class="inner">
                <nav><h2>All members</h2></nav>
                <p>This group doesn't have any members...</p>
            </div>`
            return
        }
        const stocksSorted = data["Members"].sort((a, b) => {
            return Number(b["Price"]) - Number(a["Price"])
        })
        console.log(stocksSorted)
        let totalGroupValue = 0

        stocksSorted.forEach(stock => {totalGroupValue += stock["Price"]})

        console.log(totalGroupValue)
        stocksSorted.forEach((stock, i) => {
            console.log((stock["Price"]/totalGroupValue)*100)
            const shortPrice = getShortPrice(stock["Price"]/100)
            html += `<li class="stockOverview"  data-stock-id="${stock["ID"]}">
                            <a class="containing" is="a-button" href="/stocks/${stock["ID"]}">
                                <div class="stockName">${sanitiseText(stock["Name"])}</div>
                                <div>
                                    <div class="change">#${i + 1}</div>
                                    <div class="change">${shortPrice}</div>
                                    <div class="change">${getShortPrice((stock["Price"]/totalGroupValue)*100)}%</div>
                                </div>
                            </a>
                        </li>`
        })

        that.innerHTML = `<ul class="inner">
                        <div class="titlebar">
                            <div></div>
                            <h2>All members</h2>
                            <div></div>
                        </div>
                        ${html}
                    </ul>
                `
    }
}



customElements.define('stockgroups-members-list', stockgroupsMembersList);
