
class editInfluence extends HTMLElement {

    connectedCallback() {
        this.idFalloff = new Map()
        this.idFalloff.set(0, "Linear")
        this.idFalloff.set(1, "Linear")
        this.idFalloff.set(2, "Quadratic")
        this.idFalloff.set(3, "Cubic")

        this.permil = isNaN(Number(this.dataset.permil)) ? 0 : Number(this.dataset.permil)
        this.minutes = isNaN(Number(this.dataset.minutes)) ? 0 : Number(this.dataset.minutes)
        this.falloffType = isNaN(Number(this.dataset.falloffType)) ? 0 : Number(this.dataset.falloffType)
        console.log(this.falloffType)
        this.dropdownid = createDropdown(`
                            <div><input class="permille" type="number" value="${this.permil}"> &permil;/day</div>
                            <div><input class="minutes" type="number" value="${this.minutes}"> minutes</div>
                            <div class="falloff">falloff</div>`)
        this.dropdownElem = document.getElementById(this.dropdownid)
        this.dropdownElem.style.width = "18rem"
        this.dropdownElem.querySelector(".falloff").innerHTML = `<falloff-selector></falloff-selector> falloff`

        const falloffSelector = this.dropdownElem.querySelector(".falloff falloff-selector")
        const permilleSelector = this.dropdownElem.querySelector("input.permille")
        const minuteSelector = this.dropdownElem.querySelector("input.minutes")

        falloffSelector.changeValue(this.falloffType)

        this.updateDisplay()

        falloffSelector.onEdit = () => {
            console.log("Test")
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
                <div>&#9201; ${this.minutes}m</div>
                <div>&#8600; ${this.idFalloff.get(Number(this.falloffType))}</div>
            </button>`
    }

    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}

customElements.define('edit-influence', editInfluence);
