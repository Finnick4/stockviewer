
let stocksCache = undefined
let stockCache = undefined


function loadStocksData(callbackFN) {
    if (stocksCache === undefined) {
        fetch(`/api/stocks`).then(r => r.json()).then(resp => {
            updateStocksCacheWith(resp.Data)
            callbackFN(stocksCache)
        })
        return
    }

    callbackFN(stocksCache)
}


function loadStockData(stockID, callbackFN) {
    if (stockCache === undefined || !stockCache.has(stockID)) {
        loadUsersData(() => {
            callbackFN(stockCache.get(stockID))
        })
        return;
    }
    callbackFN(stockCache.get(stockID))
}

function invalidateStockCache() {
    stocksCache = undefined
    stockCache = undefined
}

function updateStocksCacheWith(newCache) {
    stocksCache = newCache
    stockCache = new Map()
    stocksCache.forEach(stock => stockCache.set(Number(stock.ID), stock))
}
