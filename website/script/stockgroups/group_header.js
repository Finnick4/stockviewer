class stockGroupHeader extends HTMLElement {
    connectedCallback() {
        this.groupid = Number(this.dataset.stockGroupId)
        this.isAnonymousStockGroup = Number(this.groupid) === 0
        this.innerHTML = `
                        <div class="titlebar">
                            <div class="info">
                                <div class="value price">???€</div>
                                <div class="value members">${getTranslatedStr("stockgroups.header_element.loading_member_count")}</div>
                            </div>
                            <h1>${getTranslatedStr("stockgroups.header_element.loading_name")}</h1>
                            <nav class="buttons">
                                ${this.isAnonymousStockGroup ? `` : `<button is="star-stock-group-button" data-stock-group-id="${this.groupid}"></button>`}
                                ${this.isAnonymousStockGroup && userInfo.checkPerm("canCreateStockGroups") ? 
                                    `<button class="makeStockGroup" onclick="showModalCreateStockGroupFromAnonymous()" title="${getTranslatedStr("stockgroups.modify.title_create_from_anonymous")}">
                                        <img class="icon" src="/icons/plussign.svg" alt="${getTranslatedStr("stockgroups.modify.title_create_from_anonymous")}" draggable="false">          
                                    </button>` : ""}
                                ${userInfo.hasAnyEditStockGroupPermissions || this.isAnonymousStockGroup ? `<button is="edit-stock-group-button" data-stock-group-id="${this.groupid}"></button>` : ""}
                            </nav>
                        </div>
                        `
        if (this.groupid < 0) {
            this.querySelector("nav.buttons").innerHTML = ""
        }
        if (this.isAnonymousStockGroup) {
            this.closeSubscription = subscribeToAPI(`/api/stockgroups/anonymous/sse?members=${anonymousStockGroupMembers}`, addThisToFunctionCall(this.updateData, this))
        } else {
            this.closeSubscription = subscribeToAPI(`/api/stockgroups/${this.groupid}/sse`, addThisToFunctionCall(this.updateData, this))
        }
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        that.querySelector("h1").innerHTML = that.isAnonymousStockGroup ? getTranslatedStr("stockgroups.header_element.anonymous_group_title") : sanitiseText(data["Name"])
        let totalValue = 0
        let memberCount = 0
        if (data["Members"] !== undefined && data["Members"] !== null) {
            data["Members"].forEach(stock => totalValue += stock["Price"])
            memberCount = data["Members"].length
        }
        that.querySelector("div.price").innerHTML = getLocaleString(totalValue/100) + "€"
        that.querySelector("div.members").innerHTML = getTranslatedStr("stockgroups.member_count", {num: memberCount})
        if (Number(that.groupid) >= 0) {
            const starBtn = that.querySelector("nav button.star")
            if (starBtn !== null) {
                starBtn.updateStatus(data["IsStarred"])
            }
        }
    }
}

customElements.define('stock-group-header', stockGroupHeader);

