/**
 * Stores everything to know about the user that is logged in.
 */
let userInformation = {
    name: "",
    permissions: {},
    update() {
        checkLoggedIn()
        fetch(window.location.origin + "/api/users/permissions").then(resp => resp.json()).then(jsonResponse => {
            if (jsonResponse["Data"] === null || jsonResponse["Code"] !== 200) {
                userInformation.permissions = {}
                return
            }
            jsonResponse["Data"].forEach(perm => userInformation.permissions[perm["Permission"]] = perm["Value"])
        })
        fetch(window.location.origin + "/api/users/overview").then(resp => resp.json()).then(jsonResponse => {this.name = jsonResponse["Data"]})
    },
    writeName(fn) {
        if (this.name === "") {
            fetch(window.location.origin + "/api/users/overview").then(resp => resp.json()).then(jsonResponse => {
                this.name = jsonResponse["Data"]
                console.log(this.name)
                fn(this.name)
            })
        } else {
            console.log(this.name)
            fn(this.name)
        }
    }
}


userInformation.update();


