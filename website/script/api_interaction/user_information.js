
function signalLogout() {
    console.log("Logging out")
    userInfo = {
        name: "",
        tag: "",
        user_id: "",
        permissions: new Map()
    }
}

function initialiseUserInfo() {
    anonymousStockGroupMembers = []
    userInfo = {
        name: "",
        tag: "",
        user_id: "",
        permissions: new Map(),
        checkPerm: perm => userInfo.permissions.get(perm) === 1,
        hasAnyCreatePermissions: false
    }

    return new Promise((resolve, reject) => {
        Promise.all([
            fetch("/api/users/self/overview"),
            fetch("/api/users/self/permissions")
        ]).then(results => {
            let fails = false
            results.forEach(r => {
                if (r.status !== 200) {
                    fails = true
                }
            })
            if (fails) {
                console.log("Failed to get user information")
                document.cookie = "isLoggedIn=false"
                window.history.pushState(null, null, `${window.location.origin}/login`)
                buildPageLogin()
                reject()
                return
            }
            const jsonPromises = []

            results.forEach(result => jsonPromises.push(result.json()))

            Promise.all(jsonPromises).then(responses => {
                const overview = responses[0].Data
                const permissions = responses[1].Data

                userInfo.name = String(overview.Name)
                userInfo.tag = String(overview.Tag)
                userInfo.user_id = String(overview.ID)
                userInfo.checkPerm = perm => userInfo.permissions.get(perm) === 1

                const perms = new Map()

                permissions?.forEach(perm => perms.set(String(perm.Permission), Number(perm.Value)))

                const locCheckPerm = perm => perms.get(perm) === 1

                userInfo.hasAnyCreatePermissions = locCheckPerm("canCreateStocks") || locCheckPerm("canCreateArticles") || locCheckPerm("canCreateUsers")
                userInfo.hasAnyEditStockPermissions = locCheckPerm("canEditStockNames") || locCheckPerm("canEditStockColors") || locCheckPerm("canEditStockPrices") || locCheckPerm("canArchiveStocks") || locCheckPerm("canDeleteStocks")
                userInfo.hasAnyEditStockGroupPermissions = locCheckPerm("canEditStockGroupNames") || locCheckPerm("canEditStockGroupDescriptions") || locCheckPerm("canEditStockGroupMembers") ||  locCheckPerm("canDeleteStockGroups")
                userInfo.hasAnyEditArticlePermissions = locCheckPerm("canEditArticles") || locCheckPerm("canModifyInfluences")

                userInfo.canViewAdminPanelUsersTab = locCheckPerm("canEditUserPermissions") || locCheckPerm("canEditUserName") || locCheckPerm("canEditUserPassword") || locCheckPerm("canDisableUsers") || locCheckPerm("canDeleteUsers")
                userInfo.canViewAdminPanel = userInfo.hasAnyEditStockPermissions || locCheckPerm("isStockArchivist") || userInfo.canViewAdminPanelUsersTab
                userInfo.canViewUsers = locCheckPerm("canEditUserPermissions") || locCheckPerm("canEditUserName") || locCheckPerm("canEditUserPassword") || locCheckPerm("canDisableUsers") || locCheckPerm("canDeleteUsers")

                userInfo.permissions = perms

                resolve(userInfo)
            })
        })
    })
}




