
class themeSwitcherElement extends HTMLElement {
    connectedCallback() {
        const storedTheme = localStorage.getItem("theme")
        const theme = storedTheme === "light" ? "light" : "dark"

        this.innerHTML = `<button class="switcher"></button>`
        this.btn = this.querySelector(".switcher")
        this.btn.addEventListener("click", () => this.switcher())

        this.switcher(theme)
    }
    switcher(theme = "") {
        if (theme === "") {
            const storedTheme = localStorage.getItem("theme")
            theme = storedTheme !== "light" ? "light" : "dark"
        } else {
            theme = theme === "light" ? "light" : "dark"
        }

        if (theme === "light") {
            this.title = getTranslatedStr("header.theme.switch_dark")
            this.btn.innerHTML = `<img class="icon" src="/icons/darkmode.svg" alt="${getTranslatedStr("header.theme.switch_dark")}" draggable="false">`
            document.querySelector("body").dataset.theme = "light"
        } else {
            this.title = getTranslatedStr("header.theme.switch_light")
            this.btn.innerHTML = `<img class="icon" src="/icons/lightmode.svg" alt="${getTranslatedStr("header.theme.switch_light")}" draggable="false">`
            document.querySelector("body").dataset.theme = "dark"
        }
        localStorage.setItem("theme", theme)
    }
}

customElements.define('theme-switcher', themeSwitcherElement);
