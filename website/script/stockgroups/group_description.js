class stockGroupDescription extends HTMLElement {
    connectedCallback() {
        this.groupid = Number(this.dataset.stockGroupId)

        this.innerHTML = `
                        <div class="inner">
                            ${parseStyle("Loading description...")}
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
            that.querySelector("div.inner").innerHTML = parseStyle("This group doesn't have a description!\nIf you wanted, you could add one, given you have the required permission.")
        }
    }
}

customElements.define('stock-group-description', stockGroupDescription);

