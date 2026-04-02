class stockInfluenceList extends HTMLElement {
    connectedCallback() {
        this.stockid = Number(this.dataset.stockId)

        this.innerHTML = `<div class="inner">
                <div class="titlebar">
                    <nav class="displaySelector">
                        <button class="toggleViewed">${getTranslatedStr("articles.hide_seen")}</button>                                                     
                    </nav>
                    <h2>${getTranslatedStr("stocks.influences.title_all")}</h2>
                    <div></div>
                </div>
                <div class="contentTable grid-0-name-3">
                    <p class="grid-full-width">${getTranslatedStr("stocks.influences.loading")}</p>
                </div>
            </div>`

        this.articlesList = this.querySelector("div.contentTable")
        this.btnToggleViewed = this.querySelector("button.toggleViewed")
        this.titleElem = this.querySelector("div.titlebar h2")
        this.onlyUnread = false

        this.btnToggleViewed.addEventListener("click", () => {
            this.onlyUnread = !this.onlyUnread
            this.titleElem.innerHTML = this.onlyUnread ? getTranslatedStr("stocks.influences.title_unread") : getTranslatedStr("stocks.influences.title_all")
            this.btnToggleViewed.innerHTML = this.onlyUnread ? getTranslatedStr("articles.show_seen") : getTranslatedStr("articles.hide_seen")
            this.offset = 0
            this.updateContent()
        })

        this.updateContent()
    }
    updateContent() {
        fetch(`/api/stocks/${this.stockid}/influences${this.onlyUnread ? "/unread" : ""}`).then(r => r.json()).then(resp => {
            const data = resp["Data"]
            let html = ""
            
            if (resp["Data"] === null || resp["Data"].length === 0) {
                this.articlesList.innerHTML = `
                        <p class="grid-full-width">${this.onlyUnread ? getTranslatedStr("stocks.influences.no_unread_influences") : getTranslatedStr("stocks.influences.no_active_influences")}</p>
                `
            } else {
                data.forEach(article => {
                    html += `
                    <a is="a-button" class="containing" href="/articles/${article["ArticleID"]}" data-article-id="${article["ArticleID"]}">
                        <div class="name">${sanitiseText(article["ArticleTitle"])}</div>
                        <div class="value">${article["PermillePerDay"]}${getTranslatedStr("articles.permille_per_day")}</div>
                        <div class="value">${article["LengthMinutes"]}${getTranslatedStr("articles.length_minutes_short")}</div>
                    </a>`
                })

                this.articlesList.innerHTML = html
            }
        })
    }
}



customElements.define('stock-influence-list', stockInfluenceList);
