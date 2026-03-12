class colorSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button class="selector">Select</button>`

        this.readOnly = false

        const dropdownid = createDropdown(`
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="760009"></div>
                <div class="colorDisplay" data-color="861118"></div>
                <div class="colorDisplay" data-color="972527"></div>
                <div class="colorDisplay" data-color="a83634"></div>
                <div class="colorDisplay" data-color="b94642"></div>
                <div class="colorDisplay" data-color="ca5551"></div>
                <div class="colorDisplay" data-color="dc655f"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="720d00"></div>
                <div class="colorDisplay" data-color="822100"></div>
                <div class="colorDisplay" data-color="923100"></div>
                <div class="colorDisplay" data-color="a34100"></div>
                <div class="colorDisplay" data-color="b45000"></div>
                <div class="colorDisplay" data-color="c46016"></div>
                <div class="colorDisplay" data-color="d56f2c"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="583100"></div>
                <div class="colorDisplay" data-color="673f00"></div>
                <div class="colorDisplay" data-color="754d00"></div>
                <div class="colorDisplay" data-color="845c00"></div>
                <div class="colorDisplay" data-color="936b00"></div>
                <div class="colorDisplay" data-color="a37a00"></div>
                <div class="colorDisplay" data-color="b38900"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="0a4900"></div>
                <div class="colorDisplay" data-color="1b5700"></div>
                <div class="colorDisplay" data-color="2a6600"></div>
                <div class="colorDisplay" data-color="397500"></div>
                <div class="colorDisplay" data-color="478416"></div>
                <div class="colorDisplay" data-color="56932b"></div>
                <div class="colorDisplay" data-color="65a33c"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="005036"></div>
                <div class="colorDisplay" data-color="005f43"></div>
                <div class="colorDisplay" data-color="006e50"></div>
                <div class="colorDisplay" data-color="007d5e"></div>
                <div class="colorDisplay" data-color="008c6c"></div>
                <div class="colorDisplay" data-color="009c7b"></div>
                <div class="colorDisplay" data-color="00ab8a"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="00496a"></div>
                <div class="colorDisplay" data-color="005779"></div>
                <div class="colorDisplay" data-color="006688"></div>
                <div class="colorDisplay" data-color="007598"></div>
                <div class="colorDisplay" data-color="0085a7"></div>
                <div class="colorDisplay" data-color="0094b7"></div>
                <div class="colorDisplay" data-color="00a4c8"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="382483"></div>
                <div class="colorDisplay" data-color="443493"></div>
                <div class="colorDisplay" data-color="5043a3"></div>
                <div class="colorDisplay" data-color="5d52b4"></div>
                <div class="colorDisplay" data-color="6b61c4"></div>
                <div class="colorDisplay" data-color="7970d5"></div>
                <div class="colorDisplay" data-color="877fe6"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="710037"></div>
                <div class="colorDisplay" data-color="811044"></div>
                <div class="colorDisplay" data-color="922452"></div>
                <div class="colorDisplay" data-color="a33460"></div>
                <div class="colorDisplay" data-color="b4446e"></div>
                <div class="colorDisplay" data-color="c5547c"></div>
                <div class="colorDisplay" data-color="d6638b"></div>
            </div>
            <div class="colorDisplayRow">
                <div class="colorDisplay" data-color="3a3a3a"></div>
                <div class="colorDisplay" data-color="484848"></div>
                <div class="colorDisplay" data-color="555555"></div>
                <div class="colorDisplay" data-color="636363"></div>
                <div class="colorDisplay" data-color="717171"></div>
                <div class="colorDisplay" data-color="808080"></div>
                <div class="colorDisplay" data-color="8f8f8f"></div>
            </div>
            <button class="remove">Remove Color</button>
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
                    dropdown.togglePopover(false)
                }
            })
        })
        dropdown.querySelector("button.remove").addEventListener("click", () => {
            if (!this.readOnly) {
                this.color = -1
                selector.style.backgroundColor = ``
                dropdown.togglePopover(false)
            }
        })

        dropdown.style.width = "calc(32ch -  1rem)"
    }
}



customElements.define('color-selector', colorSelectorElement);
