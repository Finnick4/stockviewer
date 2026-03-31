class stockGroupDescription extends HTMLElement {
    connectedCallback() {
        this.groupid = Number(this.dataset.stockGroupId)

        this.innerHTML = `
                        <div class="inner">
                            ${parseStyle(getTranslatedStr("stockgroups.description.loading"))}
                        </div>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stockgroups/${this.groupid}/sse`, addThisToFunctionCall(this.updateData, this))
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        if (data["Description"] !== "") {
            that.querySelector("div.inner").innerHTML = parseStyle(data["Description"])
        } else {
            that.querySelector("div.inner").innerHTML = parseStyle(`${getTranslatedStr("stockgroups.description_element.empty_notice")}\n${getTranslatedStr("stockgroups.description_element.empty_hint")}`)
        }
    }
}

customElements.define('stock-group-description', stockGroupDescription);

