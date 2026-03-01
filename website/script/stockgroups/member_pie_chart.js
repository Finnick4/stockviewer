class stockgroupsMemberPieChart extends HTMLElement {
    connectedCallback() {
        this.groupid = this.dataset.stockGroupId
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/sse/?id=${this.groupid}`, addThisToFunctionCall(this.updateData, this))

        this.pie = document.createElement("div")
        this.legend = document.createElement("div")

        this.pie.className = "piechart"
        this.legend.className = "piechartlegend"

        this.appendChild(this.pie)
        this.appendChild(this.legend)
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        if (that.pie === undefined || that.legend === undefined) {
            that.innerHTML = ""

            that.pie = document.createElement("div")
            that.legend = document.createElement("div")

            that.pie.className = "piechart"
            that.legend.className = "piechartlegend"

            that.appendChild(that.pie)
            that.appendChild(that.legend)
        }

        let html = ""
        if (data["Members"] === null) {
            return
        }
        const stocksSorted = data["Members"].sort((a, b) => {
            return Number(b["Price"]) - Number(a["Price"])
        })
        console.log(stocksSorted)

        let totalGroupValue = 0
        stocksSorted.forEach(stock => {totalGroupValue += stock["Price"]})
        console.log(totalGroupValue)

        const getColor = num => {
            const colors = [
                "oklch(0.6 0.2 30)",
                "oklch(0.6 0.2 80)",
                "oklch(0.6 0.2 160)",
                "oklch(0.6 0.2 210)",
                "oklch(0.6 0.2 260)",
                "oklch(0.6 0.2 300)",
                "oklch(0.6 0.2 350)",
                "oklch(0.6 0.2 130)"
            ]
            const numColors = stocksSorted.length % 5 === 0 ? colors.length - 1 : colors.length
            return colors[num % numColors]
        }

        let from = 0, to = 0, css = "";
        stocksSorted.forEach((stock, i) => {
            to = from + Math.ceil(stock["Price"] / totalGroupValue * 360)
            if (to > 360) {
                to = 360
            }
            css += `${getColor(i)} ${from}deg ${to}deg,`
            from = to
        })

        that.pie.style.cssText = `background: conic-gradient(${css.substring(0, css.length - 1)})`
    }
}



customElements.define('stockgroups-member-pie-chart', stockgroupsMemberPieChart);
