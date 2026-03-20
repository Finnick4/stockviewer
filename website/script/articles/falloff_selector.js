class falloffSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button class="selector">Linear</button>`
        this.value = 0
        this.valueStr = "None"

        this.readOnly = false

        const dropdownid = createDropdown(`
            <div class="currentDisplay">Currently: None</div>
            <button class="option">Linear</button>
            <button class="option">Quadratic</button>
            <button class="option">Cubic</button>
        `)

        this.dropdown = document.getElementById(dropdownid)
        this.selector = this.querySelector("button.selector")
        this.currentDisplayHead = this.dropdown.querySelector("div.currentDisplay")

        this.selector.popovertarget = dropdownid
        this.selector.style.anchorName = `--anchor-${dropdownid}`
        this.selector.onclick = () => {
            if (!this.readOnly) {
                this.dropdown.togglePopover()
            }
        }
        this.changeValue(1)
    }
    changeValue(newVal) {
        const idFalloff = new Map()
        idFalloff.set(0, "Linear")
        idFalloff.set(1, "Linear")
        idFalloff.set(2, "Quadratic")
        idFalloff.set(3, "Cubic")
        this.value = Number(newVal)
        this.valueStr = idFalloff.get(Number(newVal))
        this.selector.innerHTML = this.valueStr
        this.currentDisplayHead.innerHTML = `Currently: ${this.valueStr}`

        this.dropdown.querySelectorAll("button.option").forEach((btn, i) => {
            btn.addEventListener("click", () => {
                if (!this.readOnly) {
                    this.value = i + 1
                    this.valueStr = btn.innerHTML
                    this.selector.innerHTML = this.valueStr
                    this.currentDisplayHead.innerHTML = `Currently: ${this.valueStr}`
                    this.dropdown.togglePopover(false)
                    this.onEdit()
                }
            })
        })
    }
    onEdit() {
        return
    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}



customElements.define('falloff-selector', falloffSelectorElement);
