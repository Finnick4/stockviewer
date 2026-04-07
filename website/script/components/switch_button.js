class switchButtonElement extends HTMLButtonElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `<div class="knob"></div>`
        this.classList.add("false")
        this.classList.add("switch")

        this.update()

        const knob = this.querySelector("div.knob")

        this.addEventListener("click", e => {
            if (this.readOnly) {
                return
            }
            this.state = !this.state
            this.update()
        })
    }
    update() {
        if (this.state) {
            this.classList.remove("false")
            this.classList.add("true")
        } else {
            this.classList.remove("true")
            this.classList.add("false")
        }
    }
}



customElements.define('switch-button', switchButtonElement, {extends: "button"});
