function sanitiseText(txt) {
    if (typeof(txt) === "undefined") {
        return ""
    }
    if (typeof(txt) === "number") {
        return txt
    }

    return txt.replaceAll("<", "&lt;")
}

function parseStyle(txt) {
    return "<p>" + sanitiseText(txt).replaceAll("\n", "</p><p>") + "</p>"
}

function getShortNumber(num) {
    if (isNaN(num) || typeof(num) !== "number") {
        return "0"
    }
    return Number(num).toLocaleString(langCode, {
        maximumFractionDigits: 2,
        notation: 'compact',
        compactDisplay: 'short'
    });
}

function getLocaleString(num) {
    if (isNaN(num) || typeof(num) !== "number") {
        return "0"
    }
    return Number(num).toLocaleString(langCode, {
        maximumFractionDigits: 2
    });
}

function getHexColor(num) {
    if (typeof(num) === "string") {
        if (Number(num) === -1) {
            return ""
        }
        while (num.length < 6) {
            num = "0" + num
        }
        return num
    }
    if (Number(num) === -1) {
        return ""
    }
    let hex = Number(num).toString(16)
    while (hex.length < 6) {
        hex = "0" + hex
    }
    return hex
}

function interpolateStr(str, obj) {
    if (typeof str !== "string" || typeof obj !== "object") {
        return str
    }

    return str.replace(
        /{([^{}]*)}/g,
        (template, key) => {
            const replaceVal = obj[key];
            return typeof replaceVal === 'string' || !isNaN(replaceVal) ? replaceVal : template
        }
    )
}

function createSetErr(elem) {
    if (elem)
    return err => {
        elem.innerHTML = err
        elem.classList.add("negative")
        elem.classList.remove("positive")
    }
}

function shouldUseDarkText(color) {
    if (color.charAt(0) === "#") {
        color = color.substring(1)
    }
    if (color.startsWith("oklch(")) {
        return false
    }

    const r = parseInt(color.substring(0,2), 16)
    const g = parseInt(color.substring(2,4), 16)
    const b = parseInt(color.substring(4,6), 16)

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
}

function getTranslatedDuration(duration) {
    if (duration === -1) {
        return getTranslatedStr("timeframes.durations.allTime")
    }
    if (duration < 120) {
        return getTranslatedStr("timeframes.durations.minutes", {duration: duration})
    }
    if (duration < 1440) {
        const fullHours = ((duration - (duration % 60)) / 60)
        const remainingHour = (duration % 60)/60
        return getTranslatedStr("timeframes.durations.hours", {duration:  fullHours + (remainingHour !== 0 ? remainingHour.toPrecision(2).substring(1) : "")})
    }
    if (duration === 1440) {
        return getTranslatedStr("timeframes.durations.day")
    }
    const fullDays = ((duration - (duration % 1440)) / 1440)
    const remainingDay = (duration % 1440)/1440
    return getTranslatedStr("timeframes.durations.days", {duration: fullDays + (remainingDay !== 0 ? remainingDay.toPrecision(2).substring(1) : "")})
}


function makeOneTimeFunction(fn) {
    let count = 0
    return (...args) => {
        if (count++ === 0) {
            fn(...args)
        }
    }
}
