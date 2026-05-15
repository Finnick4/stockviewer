class languageSelectorElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<button class="display">${getTranslatedStr("language.display_format", {local: getTranslatedStr("language.name_local"), global: getTranslatedStr("language.name_global")})}</button>`

        const displayBtn = this.querySelector("button.display")

        const languagesUnsorted = []
        Object.keys(supportedLanguages).forEach(langKey => {
            languagesUnsorted.push({key: langKey, local: supportedLanguages[langKey].language.name_local, global: supportedLanguages[langKey].language.name_global})
        })
        console.log(languagesUnsorted)

        const languages = languagesUnsorted.sort((a, b) => a.key.localeCompare(b.key))

        this.dropdownid = createDropdown(languages.reduce((str, language) => str + `<button class="option ${language.key === langCode ? "selected" : ""}" data-language-key="${language.key}">${getTranslatedStr("language.display_format", {local: language.local, global: language.global})}</button>`, ""))

        const dropdown = document.getElementById(this.dropdownid)

        displayBtn.popovertarget = this.dropdownid
        displayBtn.style.anchorName = `--anchor-${this.dropdownid}`
        dropdown.togglePopover(true)
        displayBtn.style.width = `${dropdown.offsetWidth}px`
        dropdown.togglePopover(false)

        displayBtn.onclick = () => {
            if (!this.readOnly) {
                dropdown.togglePopover()
            }
        }

        dropdown.querySelectorAll("button.option").forEach(btn => btn.addEventListener("click", () => {
            dropdown.togglePopover(false)
            const newLangKey = btn.dataset.languageKey
            changeLanguage(newLangKey)
            localStorage.setItem("language", newLangKey)
        }))

    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}

customElements.define('language-selector', languageSelectorElement);
