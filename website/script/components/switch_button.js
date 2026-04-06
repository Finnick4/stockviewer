class switchButtonElement extends HTMLButtonElement {
    static observedAttributes = ["state"]

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `<div class="knob"></div>`
        this.classList.add("false")
        this.classList.add("switch")

        this.state = "false"

        const knob = this.querySelector("div.knob")

        this.addEventListener("click", e => {
            if (this.readOnly) {
                return
            }

            console.log(`Switching...`)
            this.state = !this.state


            if (this.state) {
                this.classList.remove("false")
                this.classList.add("true")
            } else {
                this.classList.remove("true")
                this.classList.add("false")
            }
        })
    }
}



customElements.define('switch-button', switchButtonElement, {extends: "button"});
