class timeframeSelectorElement extends HTMLElement {
    connectedCallback() {
        const steps = [30, 60, 360, 1440, 7200]
        this.currentStep = 1
        this.value = steps[this.currentStep - 1]

        this.innerHTML = `
<button class="increase">+</button>
<button class="display"></button> 
<button class="reduce">-</button>`

        const increaseBtn = this.querySelector("button.increase")
        const displayBtn = this.querySelector("button.display")
        const decreaseBtn = this.querySelector("button.reduce")

        this.update = () => {
            displayBtn.innerHTML = getTranslatedStr("timeframes.durations.minutes", {duration: this.value})
            this.onEdit()
        }
        this.update()

        increaseBtn.addEventListener("click", () => {
            if (this.readOnly) {
                return
            }
            if (this.currentStep === steps.length) {
                return
            }
            this.currentStep++
            this.value = steps[this.currentStep - 1]

            this.update()
        })
        decreaseBtn.addEventListener("click", () => {
            if (this.readOnly) {
                return
            }
            if (this.currentStep === 1) {
                return
            }
            this.currentStep--
            this.value = steps[this.currentStep - 1]

            this.update()
        })
    }
    onEdit() {
        return
    }
}

customElements.define('timeframe-selector', timeframeSelectorElement);
