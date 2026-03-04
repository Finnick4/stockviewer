class stockgroupsMemberPieChart extends HTMLElement {
    connectedCallback() {
        this.groupid = this.dataset.stockGroupId
        this.stockColorMap = new Map
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/sse/?id=${this.groupid}`, addThisToFunctionCall(this.updateData, this))

        this.pie = document.createElement("div")

        this.pie.className = "piechart"

        this.appendChild(this.pie)
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        if (that.pie === undefined) {
            that.pie = that.querySelector("div.piechart")
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

        let from = 0, to = 0, css = "";
        stocksSorted.forEach((stock, i) => {
            to = from + Math.ceil(stock["Price"] / totalGroupValue * 360)
            if (to > 360) {
                to = 360
            }
            css += `${getColor(i)} ${from}deg ${to}deg,`
            from = to

            that.stockColorMap.set(stock["ID"], getColor(i))
        })

        that.pie.style.cssText = `background: conic-gradient(${css.substring(0, css.length - 1)})`
    }
}



customElements.define('stockgroups-member-pie-chart', stockgroupsMemberPieChart);
