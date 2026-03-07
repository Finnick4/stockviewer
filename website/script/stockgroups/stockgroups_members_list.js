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
        if (data["Members"] === null || data["Members"] === undefined) {
            that.innerHTML = `<div class="inner">
                <nav><h2>All members</h2></nav>
                <p>This group doesn't have any members...</p>
            </div>`
            return
        }

        const pieChart = document.querySelector(`main stockgroups-member-pie-chart[data-stock-group-id="${that.groupid}"]`)
        let stockColorMap = new Map
        if (pieChart !== null) {
            stockColorMap = pieChart.stockColorMap
        }

        const stocksSorted = data["Members"].sort((a, b) => {
            return Number(b["Price"]) - Number(a["Price"])
        })
        let totalGroupValue = 0

        stocksSorted.forEach(stock => {totalGroupValue += stock["Price"]})

        stocksSorted.forEach((stock, i) => {
            const shortPrice = getShortNumber(stock["Price"]/100)
            let colorIndicator = ""

            html += `<li class="stockOverview"  data-stock-id="${stock["ID"]}">
                            <a class="containing" is="a-button" href="/stocks/${stock["ID"]}">
                                <div class="identification">
                                    <div class="change shorthand colored" style="background-color: ${stockColorMap.get(stock["ID"])}">${sanitiseText(stock["Shorthand"]).toUpperCase()}</div> 
                                    <div class="stockName">${sanitiseText(stock["Name"])}</div>
                                </div>
                                <div class="info">
                                    <div class="change">#${i + 1}</div>
                                    <div class="change">${shortPrice}</div>
                                    <div class="change">${getShortNumber((stock["Price"]/totalGroupValue)*100)}%</div>
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
