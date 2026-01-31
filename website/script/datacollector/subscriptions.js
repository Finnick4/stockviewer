
let currentSubscriptions = {}
let currentSubscriptionCount = 0

function subscribeToAPI(path, func) {
    if (typeof path !== "string" || typeof func !== "function") {
        return () => {}
    }
    let id = currentSubscriptionCount++
    if (Object.keys(currentSubscriptions).indexOf(path) === - 1) {
        currentSubscriptions[path] = [{
            id: id,
            fn: func
        }]
    } else {
        currentSubscriptions[path].add({
            id: id,
            fn: func
        })
    }
    pingDataSubscribed(path)

    return () => {
        currentSubscriptions[path] = currentSubscriptions[path].filter(sub => (sub["id"] !== id))
        if (currentSubscriptions[path].length === 0) {
            delete currentSubscriptions[path]
        }
    }
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
                currentSubscriptions[path].forEach(entry => {
                    entry["fn"](r["Data"])
                })
            }
        })
    }
}