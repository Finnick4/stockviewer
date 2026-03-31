class stockgroupsList extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stockgroups.list.title")}</h2></nav>
                <p>${getTranslatedStr("stockgroups.list.loading")}</p>
            </div>`
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/sse`, addThisToFunctionCall(this.updateData, this))
    }

    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        if (data === null) {
            that.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stockgroups.list.title")}</h2></nav>
                <p>${getTranslatedStr("stockgroups.list.none")}</p>
            </div>`
            return
        }
        let html = ""
        data.forEach(e => {
            html += `<li class="stockOverview"  data-stock-group-id="${e["ID"]}">
                            <a class="containing" is="a-button" href="/groups/${e["ID"]}">
                                <div class="stockName">${sanitiseText(e["Name"])}</div>
                                <div class="info">
                                    <div class="change">${getShortNumber(e["TotalValue"]/100)}</div>
                                    <div class="change">${getTranslatedStr("stockgroups.member_count", {num: e["MemberCount"]})}</div>
                                </div>
                            </a>
                        </li>`
        })

        that.innerHTML = `<ul class="inner">
                        <div class="titlebar">
                            <nav></nav>
                            <h2>${getTranslatedStr("stockgroups.list.title")}</h2>
                            <div></div>
                        </div>
                        ${html}
                    </ul>
                `
    }
}



customElements.define('stockgroups-list', stockgroupsList);
