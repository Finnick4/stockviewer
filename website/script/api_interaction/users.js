
let usersCache = undefined
let userCache = undefined


function loadUsersData(callbackFN) {
    if (!userInfo.canViewUsers) {
        return;
    }

    if (usersCache === undefined) {
        fetch(`/api/users`).then(r => r.json()).then(resp => {
            usersCache = resp.Data
            userCache = new Map()
            usersCache?.forEach(user => userCache.set(user.ID, user))
            callbackFN(usersCache)
        })
        return
    }

    callbackFN(usersCache)
}


function loadUserData(userID, callbackFN) {
    if (!userInfo.canViewUsers) {
        return;
    }

    if (userCache === undefined || !userCache.has(userID)) {
        loadUsersData(() => {
            callbackFN(userCache.get(userID))
        })
        return;
    }
    callbackFN(userCache.get(userID))
}

function invalidateUserCache() {
    usersCache = undefined
    userCache = undefined
}