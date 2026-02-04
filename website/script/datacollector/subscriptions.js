
let currentSubscriptions = {}
let subscriptionListeners = {}
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

        subscriptionListeners[path] = {
            es: undefined,
            cache: []
        }

        subscriptionListeners[path].es = new EventSource(window.location.origin + path);

        subscriptionListeners[path].es.addEventListener("stockupdate", event => {
            subscriptionListeners[path].cache = JSON.parse(event.data)
            pingDataSubscribed(path)
        })


    } else {
        currentSubscriptions[path].add({
            id: id,
            fn: func
        })
        pingDataSubscribed(path)
    }

    return () => {
        currentSubscriptions[path] = currentSubscriptions[path].filter(sub => (sub["id"] !== id))
        if (currentSubscriptions[path].length === 0) {
            delete currentSubscriptions[path]
            subscriptionListeners[path].es.close()
            delete subscriptionListeners[path]
        }
    }
}


function addThisToFunctionCall(func, that) {
    return data => func(data, that)
}

async function pingDataSubscribed(path) {
    if (Object.keys(currentSubscriptions).indexOf(path) !== - 1) {
        currentSubscriptions[path].forEach(entry => {
            entry["fn"](subscriptionListeners[path].cache)
        })
    }
}
