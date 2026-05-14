class stockgroupsMemberPieChart extends HTMLElement {
    connectedCallback() {
        this.groupid = this.dataset.stockGroupId
        this.stockColorMap = new Map()

        if (Number(this.groupid) === 0) {
            this.closeSubscription = subscribeToAPI(`/api/stockgroups/anonymous/sse?members=${anonymousStockGroupMembers}`, addThisToFunctionCall(this.updateData, this))
        } else {
            this.closeSubscription = subscribeToAPI(`/api/stockgroups/${this.groupid}/sse`, addThisToFunctionCall(this.updateData, this))
        }

        this.innerHTML = `<svg viewBox="0 0 100 100" class="piechart"></svg>`
        this.classList.add("stockGroupMembersChartPathsHighlightable")

        this.pie = this.querySelector("svg")
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        if (that.pie === undefined) {
            that.pie = that.querySelector("svg")
        }
        that.stockColorMap = new Map()

        if (data["Members"] === null || data["Members"] === undefined) {
            return
        }
        const stocksSorted = data["Members"].sort((a, b) => {
            return Number(b["Price"]) - Number(a["Price"])
        })

        let totalGroupValue = 0
        stocksSorted.forEach(stock => {totalGroupValue += stock["Price"]})

        const hues = [
            25,
            300,
            210,
            70,
            260,
            130,
            350,
            160
        ]
        const lightness = [
            0.6,
            0.7,
            0.5
        ]
        const chromas = [
            0.17,
            0.08
        ]
        const numColors = stocksSorted.length % hues.length === 0 ? hues.length - 1 : hues.length

        const getColor = num => {
            const lightnessParam = Math.floor(num / numColors) % lightness.length
            const hueParam = num % numColors
            const chromaParam = Math.floor(num / (numColors * lightness.length)) % chromas.length
            const color =  `oklch(${lightness[lightnessParam]} ${chromas[chromaParam]} ${hues[hueParam]})`
            return color
        }

        let elems = ""
        let radOffset = 0
        const centerX = 50, centerY = 50

        stocksSorted.forEach((stock, i) => {
            const radWidth = stock["Price"] / totalGroupValue * 360 * Math.PI / 180

            const startX = Math.cos(radOffset) * 50 + centerX
            const startY = Math.sin(radOffset) * 50 + centerY

            const endX = Math.cos(radWidth + radOffset) * 50 + centerX
            const endY = Math.sin(radWidth + radOffset) * 50 + centerY

            const color = Number(stock["Color"]) === -1 ? getColor(i) : "#" + getHexColor(Number(stock["Color"]))

            elems += `<path d="M ${centerX} ${centerY} L ${startX} ${startY} A 50 50 0 ${radWidth > Math.PI ? 1 : 0} 1 ${endX} ${endY} Z" fill="${color}" data-stock-id="${stock["ID"]}"/>`

            radOffset += radWidth

            that.stockColorMap.set(stock["ID"], color)
        })
        if (stocksSorted.length === 1) {
            const stockID = stocksSorted[0].ID
            const color = that.stockColorMap.get(stockID)
            elems = `<circle cx="50" cy="50" r="50" fill="${color}" data-stock-id="${stockID}"/>`
        }

        that.pie.innerHTML = elems
    }
}



customElements.define('stockgroups-member-pie-chart', stockgroupsMemberPieChart);
