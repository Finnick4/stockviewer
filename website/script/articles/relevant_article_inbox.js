class relevantArticlesElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <div class="titlebar">
                    <nav class="displaySelector">
                        <button class="toggleViewed">${getTranslatedStr("articles.hide_seen")}</button>                                                     
                    </nav>
                    <h2>${getTranslatedStr("articles.relevant_articles.title_all")}</h2>
                    <div></div>
                </div>
                <div class="contentTable grid-0-name-3">
                    <p class="grid-full-width">${getTranslatedStr("articles.relevant_articles.loading")}</p>
                </div>
            </div>`
        this.offset = 0
        this.articlesList = this.querySelector("div.contentTable")
        this.btnToggleViewed = this.querySelector("button.toggleViewed")
        this.titleElem = this.querySelector("div.titlebar h2")
        this.onlyUnread = false
        this.classList.add("articleList")

        this.btnToggleViewed.addEventListener("click", () => {
            this.onlyUnread = !this.onlyUnread
            this.titleElem.innerHTML = this.onlyUnread ? getTranslatedStr("articles.relevant_articles.title_unread") : getTranslatedStr("articles.relevant_articles.title_all")
            this.btnToggleViewed.innerHTML = this.onlyUnread ? getTranslatedStr("articles.show_seen") : getTranslatedStr("articles.hide_seen")
            this.offset = 0
            this.updateContent()
        })
        this.updateContent()
    }

    updateContent() {
        fetch(`/api/articles/relevant${this.onlyUnread ? "/unread" : ""}`).then(r => r.json()).then(resp => {
            let html = ""

            if (resp["Data"] === null || resp["Data"].length === 0) {
                this.articlesList.innerHTML = `
                        <p class="grid-full-width">${this.onlyUnread ? getTranslatedStr("articles.relevant_articles.no_unread_articles") : getTranslatedStr("articles.relevant_articles.no_articles")}</p>
                `
            } else {
                resp["Data"].forEach(e => {
                    html += `
                            <a class="containing ${Boolean(e["Viewed"]) ? "viewed" : "unviewed"}" data-article-id="${e["ID"]}" is="a-button" href="/articles/${e["ID"]}">
                                <div class="name">${sanitiseText(e["Title"])}</div>
                                <div class="value">${getShortNumber(e["TotalViews"])} ${Number(e["TotalViews"]) === 1 ? getTranslatedStr("articles.view") : getTranslatedStr("articles.views")}</div>
                                <div class="value">${e["TotalRelevantAbsPermille"]}&permil; ${getTranslatedStr("articles.total_change")}</div>
                                <div class="value">${e["TotalRelevantInfluences"]} ${getTranslatedStr("articles.affected")}</div>
                            </a>`
                })

                this.articlesList.innerHTML = html
            }
        })
    }
}



customElements.define('relevant-articles', relevantArticlesElement);
