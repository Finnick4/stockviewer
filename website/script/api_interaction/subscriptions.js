
let currentSubscriptions = {}
let subscriptionListeners = {}
let currentSubscriptionCount = 0
let frozenSubscriptions = {}

function subscribeToAPI(path, func) {
    if (typeof path !== "string" || typeof func !== "function") {
        return () => {}
    }
    let id = currentSubscriptionCount++
    if (Object.keys(currentSubscriptions).indexOf(path) === - 1) {
        if ((path === "/api/stocks/sse" || path === "/api/stocks/sse/") && stocksCache !== undefined) {
            func(stocksCache)
        }
        if (/\/api\/stocks\/sse\/?\?timeframe=\d/.test(path.toLowerCase()) && stocksCache !== undefined) {
            const deltafied = stocksCache.map(stock => {
                return {
                    "ID": stock.ID,
                    "Name": stock.Name,
                    "Shorthand": stock.Shorthand,
                    "Color": stock.Color,
                    "Price1": stock.Price,
                    "Price2": stock.Price,
                    "DeltaAmount": 0,
                    "DeltaPercent": 0.0,
                    "Stars": stock.Stars,
                    "IsStarred": stock.IsStarred
                }
            })
            func(deltafied)
        }
        if (/\/api\/stocks\/\d+\/sse\/?$/.test(path)) {
            const stockID = Number((path.match(/\d+/))[0])
            if (stockCache !== undefined && stockCache.has(stockID)) {
                func(stockCache.get(stockID))
            }
        }

        if ((path === "/api/stockgroups/sse" || path === "/api/stockgroups/sse/") && stockGroupsCache !== undefined) {
            func(stockGroupsCache)
        }

        if (/\/api\/stockgroups\/\d+\/sse\/?$/.test(path)) {
            const groupID = Number((path.match(/\d+/))[0])
            if (groupID !== -1 && stockGroupCache !== undefined && stockGroupCache.has(groupID)) {
                func(stockGroupCache.get(groupID))
            }
        }


        if (Object.keys(currentSubscriptions).length >= 6) {
            closeUnneededSubscriptions()
        }

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
            if (path === "/api/stocks/sse" || path === "/api/stocks/sse/") {
                updateStocksCacheWith(subscriptionListeners[path].cache)
            }
            if (path === "/api/stockgroups/sse" || path === "/api/stockgroups/sse/") {
                updateStockGroupsCacheWith(subscriptionListeners[path].cache)
            }

            if (currentSubscriptions[path].length === 0) {
                delete currentSubscriptions[path]
                subscriptionListeners[path].es.close()
                delete subscriptionListeners[path]
            }
        })


    } else {
        currentSubscriptions[path].push({
            id: id,
            fn: func
        })
        pingDataSubscribed(path)
    }

    return () => {
        currentSubscriptions[path] = currentSubscriptions[path]?.filter(sub => (sub["id"] !== id))
        frozenSubscriptions[path] = frozenSubscriptions[path]?.filter(sub => (sub["id"] !== id))

        if (currentSubscriptions[path]?.length === 0) {
            console.log("closing " + path)
            delete currentSubscriptions[path]
            subscriptionListeners[path].es.close()
            delete subscriptionListeners[path]
        }
        if (frozenSubscriptions[path]?.length === 0) {
            console.log("closing (frozen) " + path)
            delete frozenSubscriptions[path]
        }
    }
}

function closeUnneededSubscriptions() {
    Object.keys(currentSubscriptions).forEach(path => {
        if (currentSubscriptions[path].length === 0) {
            delete currentSubscriptions[path]
            subscriptionListeners[path].es.close()
            delete subscriptionListeners[path]
        }
    })
    Object.keys(subscriptionListeners).forEach(path => {
        if (Object.keys(currentSubscriptions).indexOf(path) === - 1) {
            subscriptionListeners[path].es.close()
            delete subscriptionListeners[path]
        }
    })
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


document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (currentSubscriptions.length === 0) {
            return
        }

        for (const path of Object.keys(currentSubscriptions)) {
            const subscriptionGroup = currentSubscriptions[path]
            if (Object.keys(frozenSubscriptions).indexOf(path) !== - 1) {
                for (const subscription of subscriptionGroup) {
                    frozenSubscriptions[path].add(subscription)
                }
            } else {
                frozenSubscriptions[path] = subscriptionGroup
            }
        }
        currentSubscriptions = {}

        closeUnneededSubscriptions()
    } else {
        if (frozenSubscriptions.length === 0) {
            return
        }

        const addSSEListener = path => {
            subscriptionListeners[path] = {
                es: undefined,
                cache: []
            }

            subscriptionListeners[path].es = new EventSource(window.location.origin + path);

            subscriptionListeners[path].es.addEventListener("stockupdate", event => {
                subscriptionListeners[path].cache = JSON.parse(event.data)
                pingDataSubscribed(path)
                if (currentSubscriptions[path]?.length === 0) {
                    delete currentSubscriptions[path]
                    subscriptionListeners[path].es.close()
                    delete subscriptionListeners[path]
                }
            })
        }

        for (const path of Object.keys(frozenSubscriptions)) {
            const subscriptionGroup = frozenSubscriptions[path]
            if (Object.keys(currentSubscriptions).indexOf(path) !== - 1) {
                for (const subscription of subscriptionGroup) {
                    currentSubscriptions[path].add(subscription)
                }

                addSSEListener(path)
            } else {
                currentSubscriptions[path] = subscriptionGroup

                addSSEListener(path)
            }
        }
        frozenSubscriptions = {}
    }
})
