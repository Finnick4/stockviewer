class falloffSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button class="selector">${getTranslatedStr("articles.falloff.linear")}</button>`
        this.value = 0
        this.valueStr = getTranslatedStr("articles.falloff.none")

        this.readOnly = false

        const dropdownid = createDropdown(`
            <div class="currentDisplay">${getTranslatedStr("articles.falloff_currently")}: ${getTranslatedStr("articles.falloff.none")}</div>
            <button class="option">${getTranslatedStr("articles.falloff.linear")}</button>
            <button class="option">${getTranslatedStr("articles.falloff.quadratic")}</button>
            <button class="option">${getTranslatedStr("articles.falloff.cubic")}</button>
        `)

        this.dropdown = document.getElementById(dropdownid)
        this.selector = this.querySelector("button.selector")
        this.currentDisplayHead = this.dropdown.querySelector("div.currentDisplay")

        this.selector.popovertarget = dropdownid
        this.selector.style.anchorName = `--anchor-${dropdownid}`
        this.dropdown.style.width = `calc(${this.selector.style.width} - 2rem)`
        this.selector.onclick = () => {
            if (!this.readOnly) {
                this.dropdown.togglePopover()
            }
        }
        this.changeValue(1)
    }
    changeValue(newVal) {
        const idFalloff = new Map()
        idFalloff.set(0, getTranslatedStr("articles.falloff_types.linear"))
        idFalloff.set(1, getTranslatedStr("articles.falloff_types.linear"))
        idFalloff.set(2, getTranslatedStr("articles.falloff_types.quadratic"))
        idFalloff.set(3, getTranslatedStr("articles.falloff_types.cubic"))
        this.value = Number(newVal)
        this.valueStr = idFalloff.get(Number(newVal))
        this.selector.innerHTML = this.valueStr
        this.currentDisplayHead.innerHTML = `${getTranslatedStr("articles.falloff_currently")}: ${this.valueStr}`

        this.dropdown.querySelectorAll("button.option").forEach((btn, i) => {
            btn.addEventListener("click", () => {
                if (!this.readOnly) {
                    this.value = i + 1
                    this.valueStr = btn.innerHTML
                    this.selector.innerHTML = this.valueStr
                    this.currentDisplayHead.innerHTML = `${getTranslatedStr("articles.falloff_currently")}: ${this.valueStr}`
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
