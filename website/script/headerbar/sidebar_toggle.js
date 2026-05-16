
class sidebarToggleElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button></button>`
        this.btn = this.querySelector("button")
        this.btn.addEventListener("click", () => this.toggle())
        this.updateIcon()
    }
    updateIcon() {
        if (document.querySelector("header-bar")?.classList.contains("shown")) {
            this.btn.innerHTML = `<img class="icon" src="/icons/sidebar_close.svg" alt="${getTranslatedStr("header.sidebar_toggle.close")}" draggable="false">`
            this.title = getTranslatedStr("header.sidebar_toggle.close")
        } else {
            this.btn.innerHTML = `<img class="icon" src="/icons/sidebar_open.svg" alt="${getTranslatedStr("header.sidebar_toggle.close")}" draggable="false">`
            this.title = getTranslatedStr("header.sidebar_toggle.open")
        }
    }
    toggle(force = "") {
        const header = document.querySelector("header-bar")

        if (force === "") {
            if (header.classList.contains("shown")) {
                header.classList.remove("shown")
            } else {
                header.classList.add("shown")
            }
        } else {
            if (force) {
                header.classList.add("shown")
            } else {
                header.classList.remove("shown")
            }
        }
        document.querySelectorAll("sidebar-toggle").forEach(tgl => tgl.updateIcon())
    }
}

customElements.define('sidebar-toggle', sidebarToggleElement);
