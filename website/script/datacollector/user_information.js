/**
 * Stores everything to know about the user that is logged in.
 */
let userInformation = (function (){
    let name = "";
    let permissions = {};

    checkLoggedIn()
    fetch(window.location.origin + "/api/users/permissions").then(resp => resp.json()).then(jsonResponse => {
        if (jsonResponse["Data"] === null || jsonResponse["Code"] !== 200) {
            userInformation.permissions = {}
            return
        }
        jsonResponse["Data"].forEach(perm => permissions[perm["Permission"]] = perm["Value"])
    })
    fetch(window.location.origin + "/api/users/overview").then(resp => resp.json()).then(jsonResponse => {this.name = jsonResponse["Data"]})

    return {
        writeName(fn) {
            if (name === "") {
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
        hasPermission(permission) {
            if (permissions[permission] === undefined) {
                return false;
            }

            return permissions[permission] === 1;
        },
        getPermission(permission) {
            if (permissions[permission] === undefined) {
                return 0;
            }

            return Number(permissions[permission]);
        }
    }
})()

