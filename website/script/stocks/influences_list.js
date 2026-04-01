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
                html += `
                    <a is="a-button" href="/articles/${article["ArticleID"]}" data-article-id="${article["ArticleID"]}">
                        <div class="name">${sanitiseText(article["ArticleTitle"])}</div>
                        <div class="value">${article["PermillePerDay"]}${getTranslatedStr("articles.permille_per_day")}</div>
                        <div class="value">${article["LengthMinutes"]}${getTranslatedStr("articles.length_minutes_short")}</div>
                    </a>`
            })

            this.innerHTML = `<div class="inner">
                        <nav><h2>${getTranslatedStr("stocks.influences.influences")}</h2></nav>
                        <div class="contentTable grid-0-name-2">                        
                            ${html}
                        </div>
                    </div>
                `
        })
    }
}



customElements.define('stock-influence-list', stockInfluenceList);
