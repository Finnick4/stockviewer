
function changeLanguage(targetLanguage, noReroute) {
    // function initialiseLanguages() is placed in via Go. It initialises supportedLanguages with all translations
    initialiseLanguages()
    langCode = ""

    const updateLanguage = () => {
        lang = supportedLanguages[langCode]
        const header = document.querySelector(`header-bar`)
        if (header !== null) {
            header.remove()
        }
        if (!Boolean(noReroute)) {
            router()
        }
    }
    if (typeof targetLanguage === "string" || Object.keys(supportedLanguages).includes(targetLanguage)) {
        langCode = targetLanguage
        updateLanguage()
        return
    }

    const localLanguage = localStorage.getItem("language")
    if (Object.keys(supportedLanguages).includes(localLanguage)) {
        console.log(`Found language in local storage: ${localLanguage}`)
        langCode = localLanguage
        updateLanguage()
        return
    }

    for (const language of navigator.languages) {
        if (Object.keys(supportedLanguages).includes(language)) {
            console.log(`Found language in browser preferences: ${language}`)
            langCode = language
            updateLanguage()
            return
        }
    }
    console.log(`Falling back to default language: en`)
    langCode = "en"
    updateLanguage()
}


function getTranslatedStr(key, values) {
    if (typeof key !== "string") {
        return key
    }

    const path = key.split('.')
    try {
        const language = supportedLanguages[langCode ?? "en"]
        const res = path.reduce((a, v) => a[v], language)
        if (typeof res === "string") {
            return typeof values === "object" ? interpolateStr(res, values) : res
        } else {
            return getEnStr(key, values)
        }
    } catch {
        return getEnStr(key, values)
    }
}

function getEnStr(key, values) {
    if (typeof key !== "string") {
        return key
    }

    const path = key.split('.')
    try {
        const language = supportedLanguages["en"]
        const res = path.reduce((a, v) => a[v], language)
        if (typeof res === "string") {
            return typeof values === "object" ? interpolateStr(res, values) : res
        } else {
            return key
        }
    } catch {
        return key
    }
}
