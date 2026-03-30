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
                <ul class="inner">
                    <p>${getTranslatedStr("articles.relevant_articles.loading")}</p>
                </ul>
            </div>`
        this.offset = 0
        this.articlesList = this.querySelector("ul.inner")
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
                        <p>${this.onlyUnread ? getTranslatedStr("articles.relevant_articles.no_unread_articles") : getTranslatedStr("articles.relevant_articles.no_articles")}</p>
                `
            } else {
                resp["Data"].forEach(e => {
                    html += `<li class="articlePreview ${Boolean(e["Viewed"]) ? "viewed" : "unviewed"}" data-article-id="${e["ID"]}">
                            <a is="a-button" href="/articles/${e["ID"]}">
                                <div class="title">${sanitiseText(e["Title"])}</div>
                                <div class="info">
                                    <div class="change">${getShortNumber(e["TotalViews"])} view${Number(e["TotalViews"]) === 1 ? "" : "s"}</div>
                                    <div class="change">${e["TotalRelevantAbsPermille"]}&permil; ${getTranslatedStr("articles.total_change")}</div>
                                    <div class="change">${e["TotalRelevantInfluences"]} ${getTranslatedStr("articles.affected")}</div>
                                </div>
                            </a>
                        </li>`
                })

                this.articlesList.innerHTML = html
            }
        })
    }
}



customElements.define('relevant-articles', relevantArticlesElement);
