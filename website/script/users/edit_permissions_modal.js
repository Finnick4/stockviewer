function showModalEditPermissions(elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }

    if (!userInfo.checkPerm("canEditUserPermissions")) {
        createModal(`<h2>${getTranslatedStr("users.permissions.edit.title")}</h2><p>${getTranslatedStr("stocks.modify.err_no_create_permission")}</p>`)
        return
    }

    let html = `<h2>${getTranslatedStr("users.permissions.edit.title")}</h2>
                        <div class="permissions contentTable grid-0-name-2">
                            
                        </div>
                        <div class="pair">
                            <div class="info"></div>
                            <button class="submit">${getTranslatedStr("users.permissions.edit.submit")}</button>
                        </div>
                        `

    const id = createModal(html)

    const modal = document.getElementById(id);
    const infotxt = modal.querySelector(".info")
    const permissionsDiv = modal.querySelector("div.permissions")
    const permsList = ["canCreateStocks", "canEditStockNames", "canEditStockColor", "canEditStockPrices", "canArchiveStocks", "isStockArchivist", "canDisableStocks"]

    for (const permName of permsList.reverse()) {
        const elem = document.createElement("div")
        elem.classList.add("permission")
        elem.classList.add("containing")
        elem.innerHTML = `
                <p class="name">${getTranslatedStr(`users.permissions.permissions.${permName}.title`)}</p>
                <button is="switch-button"></button>
                ${getTranslatedStr(`users.permissions.permissions.${permName}.description`) !== `users.permissions.permissions.${permName}.description` ? `<p class="description grid-full-width">${getTranslatedStr(`users.permissions.permissions.${permName}.description`)}</p>` :  ""}`
        permissionsDiv.insertBefore(elem, permissionsDiv.firstChild)
    }
}

