
let currentSubscriptions = {}

function subscribeToAPI(path, func) {
    if (typeof path !== "string" || typeof func !== "function") {
        return
    }
    if (Object.keys(currentSubscriptions).indexOf(path) === - 1) {
        currentSubscriptions[path] = [func]
    } else {
        currentSubscriptions[path].add(func)
    }
    pingDataSubscribed(path)
}

function addThisToFunctionCall(func, that) {
    return data => func(data, that)
}

async function pingDataSubscribed(path) {
    if (Object.keys(currentSubscriptions).indexOf(path) !== - 1) {
        fetch(window.location.origin + path, {
            headers: {
            "Authorization": "Bearer d1ce2870b8b03f09276b402ad2744681f2a62777952eb6e265f929793045a379",
        },
        }).then(resp => resp.json()).then(r => {
            if (r["Code"] < 400) {
                currentSubscriptions[path].forEach(fn => {
                    fn(r["Data"])
                })
            }
        })
    }
}