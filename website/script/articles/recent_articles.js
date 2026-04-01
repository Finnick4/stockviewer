class recentArticlesElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <div class="titlebar">
                    <nav class="displaySelector">
                        <button class="toggleViewed">${getTranslatedStr("articles.hide_seen")}</button>                                                     
                    </nav>
                    <h2>${getTranslatedStr("articles.recent_articles.title_all")}</h2>
                    <div></div>
                </div>
                <div class="contentTable grid-0-name-2">
                    <p class="grid-full-width">${getTranslatedStr("articles.recent_articles.loading")}</p>
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
            this.titleElem.innerHTML = this.onlyUnread ? getTranslatedStr("articles.recent_articles.title_unread") : getTranslatedStr("articles.recent_articles.title_all")
            this.btnToggleViewed.innerHTML = this.onlyUnread ? getTranslatedStr("articles.show_seen") : getTranslatedStr("articles.hide_seen")
            this.offset = 0
            this.updateContent()
        })
        this.updateContent()
    }

    updateContent() {
        fetch(`/api/articles${this.onlyUnread ? "/unread" : ""}?offset=${this.offset++}`).then(r => r.json()).then(resp => {
            let html = ""

            if (resp["Data"] === null || resp["Data"].length === 0) {
                this.articlesList.innerHTML = `
                        <p class="grid-full-width">${this.onlyUnread ? getTranslatedStr("articles.recent_articles.no_unread_articles") : getTranslatedStr("articles.recent_articles.no_articles")}</p>
                `
            } else {
                resp["Data"].forEach(e => {
                    html += `
                            <a class="containing ${Boolean(e["Viewed"]) ? "viewed" : "unviewed"}" is="a-button" href="/articles/${e["ID"]}" data-article-id="${e["ID"]}">
                                <div class="name">${sanitiseText(e["Title"])}</div>
                                <div class="value">${getShortNumber(e["TotalViews"])} ${Number(e["TotalViews"]) === 1 ? getTranslatedStr("articles.view") : getTranslatedStr("articles.views")}</div>
                                <div class="value">${e["TotalInfluences"]} ${getTranslatedStr("articles.affected")}</div>
                            </a>`
                })

                this.articlesList.innerHTML = `
                        ${html}
                        <button class="loadMore grid-full-width">${getTranslatedStr("articles.load_more")}</button>
                `
                const loadMoreBtn = this.querySelector("button.loadMore")
                loadMoreBtn.addEventListener("click", () => {
                    fetch(`/api/articles${this.onlyUnread ? "/unread" : ""}?offset=${this.offset++}`).then(r => r.json()).then(resp => {
                        resp["Data"].forEach(e => {
                            const elem = new aLinkButtonElement()
                            elem.classList.add("containing")
                            elem.classList.add(`${Boolean(e["Viewed"]) ? "viewed" : "unviewed"}"`)
                            elem.dataset.articleId = e["ID"]
                            elem.href = `/articles/${e["ID"]}`
                            elem.innerHTML = `<div class="name">${sanitiseText(e["Title"])}</div>
                                              <div class="value">${getShortNumber(e["TotalViews"])} ${Number(e["TotalViews"]) === 1 ? getTranslatedStr("articles.view") : getTranslatedStr("articles.views")}</div>
                                              <div class="value">${e["TotalInfluences"]} ${getTranslatedStr("articles.affected")}</div>
                                          </a>`
                            this.articlesList.insertBefore(elem, loadMoreBtn)
                        })
                        if (resp["Data"].length < 10) {
                            loadMoreBtn.remove()
                        }
                    })
                })
            }
        })
    }
}



customElements.define('recent-articles', recentArticlesElement);
