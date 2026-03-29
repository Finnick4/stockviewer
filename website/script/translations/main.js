
function changeLanguage(targetLanguage) {
    initialiseLanguages()

    if (typeof targetLanguage === "string" || Object.keys(supportedLanguages).includes(targetLanguage)) {
        lang = supportedLanguages[targetLanguage]
        const header = document.querySelector(`header-bar`)
        if (header !== null) {
            header.remove()
        }
        router()
        return
    }

    for (const language of navigator.languages) {
        if (Object.keys(supportedLanguages).includes(language)) {
            console.log(`Found language in browser preferences: ${language}`)
            lang = supportedLanguages[language]
            const header = document.querySelector(`header-bar`)
            if (header !== null) {
                header.remove()
            }
            router()
            return
        }
    }
    console.log(`Falling back to default language: en`)
    lang = supportedLanguages.en
    const header = document.querySelector(`header-bar`)
    if (header !== null) {
        header.remove()
    }
    router()
}
