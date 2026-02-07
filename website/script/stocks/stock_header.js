class stockHeader extends HTMLElement {
    connectedCallback() {
        this.stockid = Number(this.getAttribute("data-stock-id"))

        this.innerHTML = `
                        <div>
                            <div class="change price">???€</div>
                        </div>
                        <h1>Loading name...</h1>
                        <nav>
                            <button class="star" onclick="console.log('Stars are not implemented yet!')"><img class="icon" src="/icons/star.svg" alt="give star" draggable="false"></button>
                            <button class="edit" onclick="createModal('<h1>This is not yet implemented!</h1>')"><img class="icon" src="/icons/edit.svg" alt="edit" draggable="false"></button>
                        </nav>
                        `
        this.closeSubscription = subscribeToAPI(`/api/stocks/?Id=${this.stockid}`, addThisToFunctionCall(this.updateData, this))
    }
    disconnectedCallback() {
        this.closeSubscription()
    }

    updateData(data, that) {
        that.querySelector("h1").innerHTML = data["Name"]
        that.querySelector("div.price").innerHTML = data["Price"]/100 + "€"
    }
}

customElements.define('stock-header', stockHeader);

