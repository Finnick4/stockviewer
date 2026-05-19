
class editInfluence extends HTMLElement {

    connectedCallback() {
        this.idFalloff = new Map()
        this.idFalloff.set(0, getTranslatedStr("articles.falloff_types.none"))
        this.idFalloff.set(1, getTranslatedStr("articles.falloff_types.linear"))
        this.idFalloff.set(2, getTranslatedStr("articles.falloff_types.delayed"))

        this.permil = isNaN(Number(this.dataset.permil)) ? 0 : Number(this.dataset.permil)
        this.minutes = isNaN(Number(this.dataset.minutes)) ? 0 : Number(this.dataset.minutes)
        this.falloffType = isNaN(Number(this.dataset.falloffType)) ? 0 : Number(this.dataset.falloffType)
        this.stockPriceCT = isNaN(Number(this.dataset.stockPrice)) ? 0 : Number(this.dataset.stockPrice)
        this.dropdownid = createDropdown(`
                            <div class="pair"><p>${getTranslatedStr("articles.stock_value")}:</p><p>${getShortNumber(this.stockPriceCT / 100)}</p></div> 
                            <div class="pair"><p>${getTranslatedStr("articles.permille_per_day")}:</p><input class="permille" type="number" value="${this.permil}"></div>
                            <div class="pair"><p>${getTranslatedStr("articles.length_minutes")}:</p><input class="minutes" type="number" value="${this.minutes}"></div>
                            <div class="pair falloff"></div>`)
        this.dropdownElem = document.getElementById(this.dropdownid)
        this.dropdownElem.style.width = "18rem"
        this.dropdownElem.setAttribute("popover", "manual")
        this.dropdownElem.querySelector(".falloff").innerHTML = `<p>${getTranslatedStr("articles.falloff")}:</p><falloff-selector></falloff-selector>`

        const falloffSelector = this.dropdownElem.querySelector(".falloff falloff-selector")
        const permilleSelector = this.dropdownElem.querySelector("input.permille")
        const minuteSelector = this.dropdownElem.querySelector("input.minutes")

        falloffSelector.changeValue(this.falloffType)

        this.updateDisplay()

        falloffSelector.onEdit = () => {
            this.falloffType = Number(falloffSelector.value)
            this.updateDisplay()
            this.onEdit()
        }
        permilleSelector.addEventListener("input", () => {
            this.permil = Number(permilleSelector.value)
            this.updateDisplay()
            this.onEdit()
        })
        minuteSelector.addEventListener("input", () => {
            this.minutes = Number(minuteSelector.value)
            this.updateDisplay()
            this.onEdit()
        })
    }
    onEdit() {
        return
    }
    updateDisplay() {
        this.innerHTML = `
            <button popovertarget="${this.dropdownid}" style="anchor-name: --anchor-${this.dropdownid};" class="influenceOverview">
                <div>&#8597; ${this.permil}&permil;</div>
                <div>&#9201; ${getTranslatedDuration(this.minutes)}</div>
                <div>&#8600; ${this.idFalloff.get(Number(this.falloffType))}</div>
            </button>`
    }

    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}

customElements.define('edit-influence', editInfluence);
