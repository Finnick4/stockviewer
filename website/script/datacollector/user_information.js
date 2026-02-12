/**
 * Stores everything to know about the user that is logged in.
 */
let userInformation = (function (){
    let name = "";
    let permissions = {};

    return {
        writeName(fn) {
            if (name === "") {
                checkLoggedIn();
                fetch(window.location.origin + "/api/users/overview").then(resp => resp.json()).then(jsonResponse => {
                    name = jsonResponse["Data"]
                    console.log(name)
                    fn(name)
                })
            } else {
                console.log(name)
                fn(name)
            }
        },
        writePermission(permission, fn) {
            if (permissions === {}) {
                checkLoggedIn();
                fetch(window.location.origin + "/api/users/permissions").then(resp => resp.json()).then(jsonResponse => {
                    if (jsonResponse["Data"] === null || jsonResponse["Code"] !== 200) {
                        userInformation.permissions = {}
                        fn(0);
                        return
                    }
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
            if (permissions === {}) {
                checkLoggedIn();
                fetch(window.location.origin + "/api/users/permissions").then(resp => resp.json()).then(jsonResponse => {
                    if (jsonResponse["Data"] === null || jsonResponse["Code"] !== 200) {
                        userInformation.permissions = {}
                        fn(false);
                        return
                    }
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

                fn(checkPerm("canCreateStocks"))
            }

        },
        signalLogout() {
            name = ""
            permissions = {}
        }
    }
})()

