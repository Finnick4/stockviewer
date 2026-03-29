class stockInfluenceList extends HTMLElement {
    connectedCallback() {
        this.stockid = Number(this.getAttribute("data-stock-id"))

        this.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stocks.influences.influences")}</h2></nav>
                <p>${getTranslatedStr("stocks.influences.loading")}</p>
            </div>`
        fetch(`/api/stocks/${this.stockid}/influences`).then(r => r.json()).then(resp => {
            const data = resp["Data"]
            if (data === null || data.length === 0) {
                this.innerHTML = `<div class="inner">
                <nav><h2>${getTranslatedStr("stocks.influences.influences")}</h2></nav>
                <p>${getTranslatedStr("stocks.influences.no_active_influences")}</p>
            </div>`
                return
            }

            let html = ""
            data.forEach(article => {
                html += `<li class="articlePreview" data-article-id="${article["ArticleID"]}">
                            <a is="a-button" href="/articles/${article["ArticleID"]}">
                                <div class="title">${sanitiseText(article["ArticleTitle"])}</div>
                                <div class="info ${article["PermillePerDay"] >= 0 ? "positive" : "negative"}">
                                    <div class="change">${article["PermillePerDay"]}&permil;/day</div>
                                    <div class="change">${article["LengthMinutes"]}m</div>
                                </div>
                            </a>
                        </li>`
            })

            this.innerHTML = `<ul class="inner">
                        <nav><h2>${getTranslatedStr("stocks.influences.influences")}</h2></nav>
                        ${html}
                    </ul>
                `
        })
    }
}



customElements.define('stock-influence-list', stockInfluenceList);
