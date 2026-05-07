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

        const getTranslatedDuration = duration => {
            return getTranslatedStr("timeframes.durations.minutes", {duration: duration})
        }

        this.dropdownid = createDropdown(steps.reduce((str, duration, index) => str + `<button class="option" data-time-step="${index + 1}">${getTranslatedDuration(duration)}</button>`, ""))

        const dropdown = document.getElementById(this.dropdownid)

        displayBtn.popovertarget = this.dropdownid
        displayBtn.style.anchorName = `--anchor-${this.dropdownid}`
        dropdown.togglePopover(true)
        displayBtn.style.width = `${dropdown.offsetWidth}px`
        dropdown.togglePopover(false)

        displayBtn.onclick = () => {
            if (!this.readOnly) {
                dropdown.togglePopover()
            }
        }

        dropdown.querySelectorAll("button.option").forEach(btn => btn.addEventListener("click", () => {
            dropdown.togglePopover(false)
            if (this.readOnly) {
                return
            }
            this.currentStep = Number(btn.dataset.timeStep)
            this.value = steps[this.currentStep - 1]

            this.update()
        }))


        this.update = () => {
            displayBtn.innerHTML = getTranslatedDuration(this.value)
            dropdown.querySelector("button.selected")?.classList.remove("selected")
            dropdown.querySelector(`button.option[data-time-step="${this.currentStep}"]`)?.classList.add("selected")
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
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}

customElements.define('timeframe-selector', timeframeSelectorElement);
