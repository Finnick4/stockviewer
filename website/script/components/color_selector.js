class colorSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button class="selector">${getTranslatedStr("color_selector.select")}</button>`

        this.readOnly = false

        const dropdownid = createDropdown(`
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="ca5551"></div>
                <div class="colorDisplay" data-color="d55f59"></div>
                <div class="colorDisplay" data-color="df6862"></div>
                <div class="colorDisplay" data-color="ed756e"></div>
                <div class="colorDisplay" data-color="f87e77"></div>
                <div class="colorDisplay" data-color="ff8880"></div>
                <div class="colorDisplay" data-color="ff9890"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="c85b32"></div>
                <div class="colorDisplay" data-color="d2643c"></div>
                <div class="colorDisplay" data-color="dd6d45"></div>
                <div class="colorDisplay" data-color="eb7a52"></div>
                <div class="colorDisplay" data-color="f5835b"></div>
                <div class="colorDisplay" data-color="ff8d64"></div>
                <div class="colorDisplay" data-color="ff9c75"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="b76c00"></div>
                <div class="colorDisplay" data-color="c17500"></div>
                <div class="colorDisplay" data-color="cb7f00"></div>
                <div class="colorDisplay" data-color="d98b09"></div>
                <div class="colorDisplay" data-color="e39420"></div>
                <div class="colorDisplay" data-color="e99b2a"></div>
                <div class="colorDisplay" data-color="faab3f"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="6c8e03"></div>
                <div class="colorDisplay" data-color="759819"></div>
                <div class="colorDisplay" data-color="7da127"></div>
                <div class="colorDisplay" data-color="89ae37"></div>
                <div class="colorDisplay" data-color="92b742"></div>
                <div class="colorDisplay" data-color="9bc14d"></div>
                <div class="colorDisplay" data-color="a8ce5a"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="56932b"></div>
                <div class="colorDisplay" data-color="5f9c35"></div>
                <div class="colorDisplay" data-color="68a63f"></div>
                <div class="colorDisplay" data-color="74b24c"></div>
                <div class="colorDisplay" data-color="7dbc56"></div>
                <div class="colorDisplay" data-color="86c660"></div>
                <div class="colorDisplay" data-color="92d36c"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="009a60"></div>
                <div class="colorDisplay" data-color="00a469"></div>
                <div class="colorDisplay" data-color="00ad71"></div>
                <div class="colorDisplay" data-color="23ba7d"></div>
                <div class="colorDisplay" data-color="34c486"></div>
                <div class="colorDisplay" data-color="41ce90"></div>
                <div class="colorDisplay" data-color="52db9c"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="009790"></div>
                <div class="colorDisplay" data-color="00a19a"></div>
                <div class="colorDisplay" data-color="00aba4"></div>
                <div class="colorDisplay" data-color="00b9b2"></div>
                <div class="colorDisplay" data-color="00c4bc"></div>
                <div class="colorDisplay" data-color="00cec6"></div>
                <div class="colorDisplay" data-color="00dbd3"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="2784d5"></div>
                <div class="colorDisplay" data-color="338ddf"></div>
                <div class="colorDisplay" data-color="3e96ea"></div>
                <div class="colorDisplay" data-color="4ba3f7"></div>
                <div class="colorDisplay" data-color="55adff"></div>
                <div class="colorDisplay" data-color="5fb6ff"></div>
                <div class="colorDisplay" data-color="7bc3ff"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="6875d8"></div>
                <div class="colorDisplay" data-color="707fe2"></div>
                <div class="colorDisplay" data-color="7988ed"></div>
                <div class="colorDisplay" data-color="8494fa"></div>
                <div class="colorDisplay" data-color="8d9eff"></div>
                <div class="colorDisplay" data-color="97a8ff"></div>
                <div class="colorDisplay" data-color="a7b7ff"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="8f68cb"></div>
                <div class="colorDisplay" data-color="9871d5"></div>
                <div class="colorDisplay" data-color="a17adf"></div>
                <div class="colorDisplay" data-color="ad87ed"></div>
                <div class="colorDisplay" data-color="b790f7"></div>
                <div class="colorDisplay" data-color="c099ff"></div>
                <div class="colorDisplay" data-color="cca7ff"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="b559a3"></div>
                <div class="colorDisplay" data-color="bf62ad"></div>
                <div class="colorDisplay" data-color="c96bb6"></div>
                <div class="colorDisplay" data-color="d677c3"></div>
                <div class="colorDisplay" data-color="e081cd"></div>
                <div class="colorDisplay" data-color="eb8ad7"></div>
                <div class="colorDisplay" data-color="f897e4"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="808080"></div>
                <div class="colorDisplay" data-color="898989"></div>
                <div class="colorDisplay" data-color="929292"></div>
                <div class="colorDisplay" data-color="9e9e9e"></div>
                <div class="colorDisplay" data-color="a8a8a8"></div>
                <div class="colorDisplay" data-color="b1b1b1"></div>
                <div class="colorDisplay" data-color="bebebe"></div>
            </div>
            <button class="remove">${getTranslatedStr("color_selector.remove_color")}</button>
        `)

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
