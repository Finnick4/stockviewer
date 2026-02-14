function sanitiseText(txt) {
    return txt.replaceAll("<", "&lt;")
}

function getShortPrice(price) {
    return Number(price).toLocaleString('en-US', {
        maximumFractionDigits: 2,
        notation: 'compact',
        compactDisplay: 'short'
    });
}