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
    return Number(num).toLocaleString('en-us', {
        maximumFractionDigits: 2,
        notation: 'compact',
        compactDisplay: 'short'
    });
}

function getLocaleString(num) {
    if (isNaN(num) || typeof(num) !== "number") {
        return "0"
    }
    return Number(num).toLocaleString('en-us', {
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