
let stockGroupsCache = undefined
let stockGroupCache = undefined


function loadStockGroupsData(callbackFN) {
    if (stockGroupsCache === undefined) {
        fetch(`/api/stockgroups`).then(r => r.json()).then(resp => {
            updateStockGroupsCacheWith(resp.Data)
            callbackFN(stockGroupsCache)
        })
        return
    }

    callbackFN(stockGroupsCache)
}


function loadStockGroupData(groupID, callbackFN) {
    if (stockGroupCache === undefined || !stockGroupCache.has(Number(groupID))) {
        loadStocksData(() => {
            callbackFN(stockGroupCache.get(Number(groupID)))
        })
        return;
    }
    callbackFN(stockGroupCache.get(Number(groupID)))
}

function invalidateStockGroupCache() {
    stockGroupsCache = undefined
    stockGroupCache = undefined
}

function updateStockGroupsCacheWith(newCache) {
    stockGroupsCache = newCache
    stockGroupCache = new Map()
    stockGroupsCache.forEach(group => stockGroupCache.set(Number(group.ID), group))
}
