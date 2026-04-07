function showModalEditPermissions(userID, elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }
    if (typeof userID !== "string" || userID === "") {
        console.warn("Cannot open edit permissions modal as no user ID was provided!")
        return;
    }


    if (!userInfo.checkPerm("canEditUserPermissions")) {
        createModal(`<h2>${getTranslatedStr("users.permissions.edit.title")}</h2><p>${getTranslatedStr("stocks.modify.err_no_create_permission")}</p>`)
        return
    }

    fetch(`/api/users/${userID}/permissions`).then(r => r.json()).then(resp => {
        console.log(resp)
        const data = resp.Data
        const originalPermMap = new Map()

        if (data !== null) {
            for (const perm of data) {
                originalPermMap.set(String(perm.Permission), Number(perm.Value))
            }
        }
        console.log(originalPermMap)



        let html = `<h2>${getTranslatedStr("users.permissions.edit.title")}</h2>
                            <div class="permissions contentTable grid-0-name-1">
                                
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
        const permsList = ["canCreateStocks", "canEditStockNames", "canEditStockColors", "canEditStockPrices", "canArchiveStocks", "isStockArchivist",
            "canCreateStockGroups", "canEditStockGroupNames", "canEditStockGroupDescriptions", "canEditStockGroupMembers", "canDeleteStockGroups",
            "canCreateArticles", "canEditArticles", "canModifyInfluences", "maxInfluencePermille",
            "canCreateUsers", "canEditUserPermissions", "canEditUserName", "canEditUserPassword", "canDisableUsers", "canDeleteUsers"
        ]

        for (const permName of permsList.reverse()) {
            const boolPerm = permName.startsWith("is") || permName.startsWith("can")
            const elem = document.createElement("div")
            elem.classList.add("permission")
            elem.classList.add("containing")
            elem.dataset.permission = permName
            elem.innerHTML = `
                    <p class="name">${getTranslatedStr(`users.permissions.permissions.${permName}.title`)}</p>
                    ${boolPerm ? `<button is="switch-button" class="inputField"></button>` : `<input type="number" value="0" class="inputField">`}
                    ${getTranslatedStr(`users.permissions.permissions.${permName}.description`) !== `users.permissions.permissions.${permName}.description` ? `<p class="description grid-full-width">${getTranslatedStr(`users.permissions.permissions.${permName}.description`)}</p>` :  ""}`
            if (originalPermMap.has(permName)) {
                const inputElem = elem.querySelector(".inputField")
                if (boolPerm) {
                    inputElem.state = Number(originalPermMap.get(permName)) === 1
                    inputElem.update()
                } else {
                    inputElem.value = Number(originalPermMap.get(permName))
                }
            }

            permissionsDiv.insertBefore(elem, permissionsDiv.firstChild)
        }
    })
}

