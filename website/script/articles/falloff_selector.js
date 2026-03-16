class falloffSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button class="selector">Linear</button>`
        this.value = 0
        this.valueStr = "Linear"

        this.readOnly = false

        const dropdownid = createDropdown(`
            <div class="currentDisplay">Currently: Linear</div>
            <button class="option">Linear</button>
            <button class="option">Quadratic</button>
            <button class="option">Cubic</button>
        `)

        const dropdown = document.getElementById(dropdownid)
        const selector = this.querySelector("button.selector")
        const currentDisplayHead = dropdown.querySelector("div.currentDisplay")

        selector.popovertarget = dropdownid
        selector.style.anchorName = `--anchor-${dropdownid}`
        selector.onclick = () => {
            if (!this.readOnly) {
                dropdown.togglePopover()
            }
        }
        dropdown.querySelectorAll("button.option").forEach((btn, i) => {
            btn.addEventListener("click", () => {
                if (!this.readOnly) {
                    this.value = i + 1
                    this.valueStr = btn.innerHTML
                    selector.innerHTML = this.valueStr
                    currentDisplayHead.innerHTML = `Currently: ${this.valueStr}`
                    dropdown.togglePopover(false)
                }
            })
        })
    }
}



customElements.define('falloff-selector', falloffSelectorElement);
