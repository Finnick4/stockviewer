class switchButtonElement extends HTMLButtonElement {
    static observedAttributes = ["state"]

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `<div class="knob false"></div>`
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
                knob.classList.remove("false")
                knob.classList.add("true")
                this.classList.remove("false")
                this.classList.add("true")
            } else {
                knob.classList.remove("true")
                knob.classList.add("false")
                this.classList.remove("true")
                this.classList.add("false")
            }
        })
    }
}



customElements.define('switch-button', switchButtonElement, {extends: "button"});
