class stockgroupsMembersList extends HTMLElement {
    connectedCallback() {
        this.groupid = this.dataset.stockGroupId
        this.titleVal = this.dataset.altTitle === undefined ? getTranslatedStr("stockgroups.members_list.title") : this.dataset.altTitle
        this.innerHTML = `<div class="inner">
                <nav><h2>${this.titleVal}</h2></nav>
                <p>${getTranslatedStr("stockgroups.members_list.loading")}</p>
            </div>`
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/${this.groupid}/sse`, addThisToFunctionCall(this.updateData, this))
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        let html = ""
        if (data["Members"] === null || data["Members"] === undefined) {
            that.innerHTML = `<div class="inner">
                <nav><h2>${that.titleVal}</h2></nav>
                <p>${getTranslatedStr("stockgroups.members_list.none")}</p>
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
            let color = ""
            if (pieChart !== null) {
                color = stockColorMap.get(stock["ID"])
            } else {
                color = `#${getHexColor(Number(stock["Color"]))}`
            }

            html += `
                <a class="containing" is="a-button" href="/stocks/${stock["ID"]}" data-stock-id="${stock["ID"]}">
                    <div class="value shorthand colored" style="background-color: ${color}">${sanitiseText(stock["Shorthand"]).toUpperCase()}</div> 
                    <div class="name">${sanitiseText(stock["Name"])}</div>
                    <div class="value">#${i + 1}</div>
                    <div class="value">${shortPrice}</div>
                    <div class="value">${getShortNumber((stock["Price"]/totalGroupValue)*100)}%</div>
                </a>
                        `
        })

        that.innerHTML = `<div class="inner">
                        <div class="titlebar">
                            <div></div>
                            <h2>${that.titleVal}</h2>
                            <div></div>
                        </div>
                        <div class="contentTable grid-1-name-3">
                            ${html}
                        </div>
                    </div>
                `
        that.querySelectorAll(`a.containing`).forEach(elem => {
            const stockid = elem.dataset.stockId
            elem.addEventListener("mouseenter", () => {
                document.querySelectorAll(`stock-group-chart[data-stock-group-id="${that.groupid}"] svg path`).forEach(e => {
                    if (e.dataset.stockId !== stockid) {
                        e.classList.add("unhighlighted")
                    } else {
                        const svg = e.parentElement
                        svg.insertBefore(e, svg.children[-1])
                    }
                })
            })
            elem.addEventListener("mouseleave", () => {
                document.querySelectorAll(`stock-group-chart[data-stock-group-id="${that.groupid}"] svg path.unhighlighted`).forEach(e => e.classList.remove("unhighlighted"))
            })
        })
    }
}



customElements.define('stockgroups-members-list', stockgroupsMembersList);
