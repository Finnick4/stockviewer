class stockgroupsStarredList extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stockgroups.starred_list.title")}</h2></nav>
                <p>${getTranslatedStr("stockgroups.starred_list.loading")}</p>
            </div>`
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/starred/sse`, addThisToFunctionCall(this.updateData, this))
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        if (data === null) {
            that.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stockgroups.starred_list.title")}</h2></nav>
                <p>${getTranslatedStr("stockgroups.starred_list.none")}</p>
            </div>`
            return
        }
        let html = ""
        data.forEach(e => {
            html += `
                <a class="containing" is="a-button" href="/groups/${e["ID"]}">
                    <div class="name">${sanitiseText(e["Name"])}</div>
                    <button is="star-stock-group-button" data-stock-group-id="${e.ID}"></button>
                    <div class="value">${getShortNumber(e["TotalValue"]/100)}</div>
                    <div class="value">${getTranslatedStr("stockgroups.member_count", {num: e["MemberCount"]})}</div>
                </a>
`
        })

        that.innerHTML = `<div class="inner">
                        <div class="titlebar">
                            <nav></nav>
                            <h2>${getTranslatedStr("stockgroups.starred_list.title")}</h2>
                            <div></div>
                        </div>
                        <div class="contentTable grid-0-name-3">
                            ${html}
                        </div>
                    </div>
                `

        that.querySelectorAll("button.star").forEach(btn => {
            btn.updateStatus(true)
            btn.addEventListener("click", e => {
                e.preventDefault()
                e.stopPropagation()
            })
        })
    }
}



customElements.define('stockgroups-starred-list', stockgroupsStarredList);
