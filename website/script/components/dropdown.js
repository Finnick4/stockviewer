
let dropdownCount = 0

function createDropdown(html) {
    let dropdown = document.createElement("div")
    dropdown.className = "dropdown"
    dropdown.id = "dropdown-" + dropdownCount
    dropdown.innerHTML = html
    dropdown.setAttribute("popover", "auto")
    dropdown.setAttribute("style", `position-anchor: --anchor-${dropdown.id};`)

    document.body.insertBefore(dropdown, document.body.childNodes[0]);
    dropdownCount++
    return dropdown.id
}

function deleteDropdown(id) {
    document.body.removeChild(document.getElementById(id))
}
