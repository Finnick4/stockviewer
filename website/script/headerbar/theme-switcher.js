
class themeSwitcherElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button onclick="themeSwitcherSwitch(this)"><img class="icon" src="/icons/lightmode.svg" alt="switch dark-/lightmode" draggable="false"></button>`
    }
}

function themeSwitcherSwitch(elem) {
    if (document.querySelector("body").getAttribute("data-theme") === "light") {
        elem.innerHTML = `<img class="icon" src="/icons/lightmode.svg" alt="switch to lightmode" draggable="false">`
        document.querySelector("body").setAttribute("data-theme", "dark")
    } else {
        elem.innerHTML = `<img class="icon" src="/icons/darkmode.svg" alt="switch to darkmode" draggable="false">`
        document.querySelector("body").setAttribute("data-theme", "light")
    }
}


customElements.define('theme-switcher', themeSwitcherElement);
