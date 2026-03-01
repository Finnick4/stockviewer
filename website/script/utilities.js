function sanitiseText(txt) {
    if (typeof(txt) === "undefined") {
        return ""
    }
    if (typeof(txt) === "number") {
        return txt
    }

    return txt.replaceAll("<", "&lt;")
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
