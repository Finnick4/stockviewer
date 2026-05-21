class colorSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button class="selector">${getTranslatedStr("color_selector.select")}</button>`

        this.readOnly = false

        const possibleColors = [
            ["ca5551", "d55f59", "df6862", "ed756e", "f87e77", "ff8880", "ff9890"],
            ["c85b32", "d2643c", "dd6d45", "eb7a52", "f5835b", "ff8d64", "ff9c75"],
            ["b76c00", "c17500", "cb7f00", "d98b09", "e39420", "e99b2a", "faab3f"],
            ["6c8e03", "759819", "7da127", "89ae37", "92b742", "9bc14d", "a8ce5a"]
        ]


        let dropdownHTML = ""

        for (const colorRange of possibleColors) {
            dropdownHTML += `<div class="colorDisplayRow">`
            for (const color of colorRange) {
                dropdownHTML += `<div class="colorDisplay" data-color="${color}"></div>`
            }
            dropdownHTML += `</div>`
        }
        dropdownHTML += `<button class="remove">${getTranslatedStr("color_selector.remove_color")}</button>`

        const dropdownid = createDropdown(dropdownHTML)

        const dropdown = document.getElementById(dropdownid)
        const selector = this.querySelector("button.selector")
        this.color = getHexColor(this.dataset.color)
        selector.style.backgroundColor = `#${this.color}`

        selector.popovertarget = dropdownid
        selector.style.anchorName = `--anchor-${dropdownid}`
        selector.onclick = () => {
            if (!this.readOnly) {
                dropdown.togglePopover()
            }
        }
        dropdown.querySelectorAll("div.colorDisplay").forEach(elem => {
            elem.style.backgroundColor = `#${elem.dataset.color}`
            elem.addEventListener("click", () => {
                if (!this.readOnly) {
                    this.color = elem.dataset.color
                    selector.style.backgroundColor = `#${elem.dataset.color}`
                    selector.classList.remove("dark", "light")
                    selector.classList.add("colored", shouldUseDarkText(getHexColor(elem.dataset.color)) ? "dark" : "light")
                    dropdown.togglePopover(false)
                }
            })
        })
        dropdown.querySelector("button.remove").addEventListener("click", () => {
            if (!this.readOnly) {
                this.color = -1
                selector.style.backgroundColor = ``
                selector.classList.remove("colored", "dark", "light")
                dropdown.togglePopover(false)
            }
        })

        dropdown.style.width = "calc(32ch -  1rem)"
    }
}



customElements.define('color-selector', colorSelectorElement);
