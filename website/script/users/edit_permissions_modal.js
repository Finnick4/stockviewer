function showModalEditPermissions(userID, elem) {
    if (elem != null && elem.parentElement.getAttribute("popover") != null) {
        elem.parentElement.togglePopover(false)
    }
    if (typeof userID !== "string" || userID === "") {
        console.warn("Cannot open edit permissions modal as no user ID was provided!")
        return;
    }

    if (!userInfo.checkPerm("canEditUserPermissions")) {
        createModal(`<h2>${getTranslatedStr("users.permissions.edit.title")}</h2><p>${getTranslatedStr("users.permissions.edit.err_no_edit_permission")}</p>`)
        return
    }

    if (userID === userInfo.user_id) {
        createModal(`<h2>${getTranslatedStr("users.permissions.edit.title")}</h2><p>${getTranslatedStr("users.permissions.edit.err_edit_self")}</p>`)
        return
    }

    fetch(`/api/users/${userID}/permissions`).then(r => r.json()).then(resp => {
        const data = resp.Data
        const originalPermMap = new Map()

        if (data !== null) {
            for (const perm of data) {
                originalPermMap.set(String(perm.Permission), Number(perm.Value))
            }
        }


        let html = `<h2>${getTranslatedStr("users.permissions.edit.title")}</h2>
                            <div class="permissions contentTable grid-0-name-1">
                                
                            </div>
                            <div class="pair submit">
                                <div class="info"></div>
                                <button class="submit">${getTranslatedStr("users.permissions.edit.submit")}</button>
                            </div>
                            `

        const id = createModal(html)

        const modal = document.getElementById(id);
        modal.classList.add("wider")
        const infotxt = modal.querySelector(".info")
        const permissionsDiv = modal.querySelector("div.permissions")
        const permsList = [
            {groupName: "stocks", perms: ["canCreateStocks", "canEditStockNames", "canEditStockColors", "canEditStockPrices", "canArchiveStocks", "isStockArchivist"]},
            {groupName: "stock_groups", perms: ["canCreateStockGroups", "canEditStockGroupNames", "canEditStockGroupDescriptions", "canEditStockGroupMembers", "canDeleteStockGroups"]},
            {groupName: "articles", perms: ["canCreateArticles", "canEditArticles", "canModifyInfluences", "maxInfluencePermille"]},
            {groupName: "users", perms: ["canCreateUsers", "canEditUserPermissions", "canEditUserName", "canEditUserPassword", "canDisableUsers", "canDeleteUsers"]}
        ]

        const isBoolPerm = perm => perm.startsWith("is") || perm.startsWith("can")

        for (const permGroup of permsList) {
            const groupElem = document.createElement("div")
            groupElem.classList.add("permissionGroup")
            groupElem.classList.add("passthrough")
            groupElem.dataset.groupName = permGroup.groupName
            groupElem.innerHTML = `<h2 class="grid-full-width">${getTranslatedStr(`users.permissions.groups.${permGroup.groupName}`)}</h2>`
            permissionsDiv.appendChild(groupElem)

            for (const permName of permGroup.perms) {
                const boolPerm = isBoolPerm(permName)
                const elem = document.createElement("div")
                elem.classList.add("permission")
                elem.classList.add("containing")
                elem.dataset.permission = permName
                elem.innerHTML = `
                    <h3 class="name">${getTranslatedStr(`users.permissions.permissions.${permName}.title`)}</h3>
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

                groupElem.appendChild(elem)
            }
        }

        const setErr = createSetErr(infotxt)

        const forEachEdited = fn => {
            for (const permissionDiv of permissionsDiv.querySelectorAll(".permission")) {
                const perm = permissionDiv.dataset.permission
                const boolPerm = isBoolPerm(perm)
                const newValue = boolPerm ? Number(permissionDiv.querySelector(".inputField").state) : Number(permissionDiv.querySelector(".inputField").value)
                if ((originalPermMap.has(perm) && originalPermMap.get(perm) === newValue) || (!originalPermMap.has(perm) && newValue === 0)) {
                    // There is no change in this permission. Skipping this permission
                    continue
                }
                fn(perm, newValue, boolPerm)
            }
        }

        const verify = () => {
            let escape = false
            forEachEdited((perm, newValue, boolPerm) => {
                if (escape) {
                    return false
                }
                const userPermValue = userInfo.permissions.get(perm)
                if (!userInfo.permissions.has(perm)) {
                    setErr(getTranslatedStr("users.permissions.edit.err_no_permission", {permission: perm}))
                    escape = true
                    return false
                }
                if (boolPerm && userPermValue !== 1) {
                    setErr(getTranslatedStr("users.permissions.edit.err_no_permission", {permission: perm}))
                    escape = true
                    return false
                }
                if (!boolPerm && userPermValue < newValue && userPermValue !== -1) {
                    setErr(getTranslatedStr("users.permissions.edit.err_too_high_value", {permission: perm, proposed: newValue, own: userPermValue}))
                    escape = true
                    return false
                }
                if (!boolPerm && newValue === -1 && userPermValue !== -1) {
                    setErr(getTranslatedStr("users.permissions.edit.err_uncapped", {permission: perm}))
                    escape = true
                    return false
                }
                if (!boolPerm && newValue < -1) {
                    setErr(getTranslatedStr("users.permissions.edit.err_invalid", {permission: perm}))
                    escape = true
                    return false
                }
            })
            if (escape) {
                return false
            }
            infotxt.innerHTML = getTranslatedStr("users.permissions.edit.values_okay")
            infotxt.classList.add("positive")
            infotxt.classList.remove("negative")
            return true
        }
        verify()

        permissionsDiv.querySelectorAll("button.inputField").forEach(btn => btn.onEdit = () => verify())
        permissionsDiv.querySelectorAll("input.inputField").forEach(inpt => inpt.addEventListener("input", () => verify()))

        modal.querySelector(`input.submit`).addEventListener("click", () => {
            if (verify()) {
                const editedPermissions = []
                const addPermissionValue = (perm, value) => editedPermissions.push({Permission: perm, Value: value})

                forEachEdited((perm, value) => {
                    if (!isNaN(value)) {
                        addPermissionValue(perm, value)
                    }
                })

                fetch(`${window.location.origin}/api/users/${userID}/permissions`, {
                    method: "PUT",
                    body: JSON.stringify({
                        Permissions: editedPermissions
                    })
                }).then(r => {
                    if (r.ok) {
                        closeModal(id)
                    } else {
                        if (r.status >= 400 || r.status < 500) {
                            setErr(getTranslatedStr("network.issues.generic_request", {code: r.status}))
                        } else {
                            setErr(getTranslatedStr("network.issues.generic_server", {code: r.status}))
                        }
                    }
                });
            }
        })
    })
}

