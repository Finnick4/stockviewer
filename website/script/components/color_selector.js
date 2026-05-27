class colorSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button class="selector">${getTranslatedStr("color_selector.select")}</button>`

        this.readOnly = false

        const possibleColors = [
            ["3c096c", "5a189a", "7b2cbf", "9d4edd", "c77dff"], // purple
            ["a4133c", "c9184a", "ff4d6d", "ff758f", "ff8fa3"], // pink
            ["aa0000", "cd0000", "de1616", "ef2b2b", "ec4040"], // red
            ["bb5008", "d0630e", "e47513", "f58d19", "fa9f1c"], // orange
            ["ff8800", "ffa200", "ffb700", "ffd000", "ffea00"], // yellow
            ["014f86", "2a6f97", "0096c7", "48cae4", "90e0ef"], // blue
            ["245501", "245501", "538d22", "73a942", "aad576"], // green
            ["7f5539", "9c6644", "b08968", "ddb892", "e6ccb2"], // brown
            ["343a40", "495057", "6c757d", "adb5bd", "ced4da"], // gray
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

        this.setColor = col => {
            this.color = getHexColor(col)
            selector.style.backgroundColor = `#${this.color}`
        }
        this.setColor(this.dataset.color)

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
