class aLinkButtonElement extends HTMLAnchorElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.addEventListener("click", e => {
            window.history.pushState(null, null, `${this.href}`)
            e.preventDefault()
        })
    }
}



customElements.define('a-button', aLinkButtonElement, {extends: "a"});
