/**
 * Stores everything to know about the user that is logged in.
 */
let userInformation = (function (){
    let name = "";
    let tag = "";
    let userid = "";
    let permissions = {};

    checkLoggedIn()
    fetch(window.location.origin + "/api/users/permissions").then(resp => resp.json()).then(jsonResponse => {
        if (jsonResponse["Data"] === null || jsonResponse["Code"] !== 200) {
            userInformation.permissions = {}
            return
        }
        jsonResponse["Data"].forEach(perm => permissions[perm["Permission"]] = perm["Value"])
    })
    fetch(window.location.origin + "/api/users/overview").then(resp => resp.json()).then(jsonResponse => {
        name = jsonResponse["Data"]["Name"]
        tag = jsonResponse["Data"]["Tag"]
        userid = jsonResponse["Data"]["Id"]
    })

    return {
        writeDisplayName(fn) {
            if (name === "") {
                checkLoggedIn();
                fetch(window.location.origin + "/api/users/overview").then(resp => resp.json()).then(jsonResponse => {
                    name = sanitiseText(jsonResponse["Data"]["Name"])
                    tag = sanitiseText(jsonResponse["Data"]["Tag"])
                    userid = sanitiseText(jsonResponse["Data"]["Id"])
                    console.log(sanitiseText(name))
                    fn(sanitiseText(name))
                })
            } else {
                console.log(sanitiseText(name))
                fn(sanitiseText(name))
            }
        },
        writePermission(permission, fn) {
            if (Object.keys(permissions).length === 0) {
                checkLoggedIn();
                fetch(window.location.origin + "/api/users/permissions").then(resp => resp.json()).then(jsonResponse => {
                    if (jsonResponse["Data"] === null || jsonResponse["Code"] !== 200) {
                        userInformation.permissions = {}
                        console.log("Error with getting permissions: " + jsonResponse["Code"])
                        fn(0);
                        return
                    }
                    console.log("Fetched Permissions!")
                    jsonResponse["Data"].forEach(perm => permissions[perm["Permission"]] = perm["Value"])
                    this.writePermission(permission, fn)
                })
            } else {
                if (permissions[permission] === undefined) {
                    fn(0);
                }

                fn(Number(permissions[permission]));
            }
        },
        hasAnyCreatePermissions(fn) {
            if (Object.keys(permissions).length === 0) {
                checkLoggedIn();
                fetch(window.location.origin + "/api/users/permissions").then(resp => resp.json()).then(jsonResponse => {
                    if (jsonResponse["Data"] === null || jsonResponse["Code"] !== 200) {
                        userInformation.permissions = {}
                        console.log("Error with getting permissions: " + jsonResponse["Code"])
                        fn(false);
                        return
                    }
                    console.log("Fetched Permissions!")
                    jsonResponse["Data"].forEach(perm => permissions[perm["Permission"]] = perm["Value"])
                    this.hasAnyCreatePermissions(fn)
                })
            } else {
                const checkPerm = p => {
                    if (permissions[p] === undefined) {
                        return false
                    }
                    return permissions[p] === 1
                }

                fn(checkPerm("canCreateStocks") || checkPerm("canCreateArticles") || checkPerm("canCreateUsers"))
            }

        },
        signalLogout() {
            console.log("Logging out")
            name = ""
            for (const perm in permissions) {
                delete permissions[perm]
            }
        }
    }
})()

