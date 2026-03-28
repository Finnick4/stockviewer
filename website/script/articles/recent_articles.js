class recentArticlesElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <div class="titlebar">
                    <nav class="displaySelctor">
                        <button class="toggleViewed">Hide seen</button>                                                     
                    </nav>
                    <h2>All articles</h2>
                    <div></div>
                </div>
                <ul class="inner">
                    <p>Loading articles...</p>
                </ul>
            </div>`
        this.offset = 0
        this.articlesList = this.querySelector("ul.inner")
        this.btnToggleViewed = this.querySelector("button.toggleViewed")
        this.titleElem = this.querySelector("div.titlebar h2")
        this.onlyUnread = false

        this.btnToggleViewed.addEventListener("click", () => {
            this.onlyUnread = !this.onlyUnread
            this.titleElem.innerHTML = this.onlyUnread ? "Unread articles" : "All articles"
            this.btnToggleViewed.innerHTML = this.onlyUnread ? "Show seen" : "Hide seen"
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
                        <p>There are no${this.onlyUnread ? " unread" : ""} articles</p>
                `
            } else {
                resp["Data"].forEach(e => {
                    html += `<li class="articlePreview ${Boolean(e["Viewed"]) ? "viewed" : "unviewed"}" data-article-id="${e["ID"]}">
                            <a is="a-button" href="/articles/${e["ID"]}">
                                <div class="title">${sanitiseText(e["Title"])}</div>
                                <div class="info">
                                    <div class="change">${getShortNumber(e["TotalViews"])} view${Number(e["TotalViews"]) === 1 ? "" : "s"}</div>
                                    <div class="change">${e["TotalInfluences"]} affected</div>
                                </div>
                            </a>
                        </li>`
                })

                this.articlesList.innerHTML = `
                        ${html}
                        <button class="articlePreview loadMore">Load more articles</button>
                `
                const loadMoreBtn = this.querySelector("button.loadMore")
                const ul = this.querySelector("ul.inner")
                loadMoreBtn.addEventListener("click", () => {
                    fetch(`/api/articles${this.onlyUnread ? "/unread" : ""}?offset=${this.offset++}`).then(r => r.json()).then(resp => {
                        resp["Data"].forEach(e => {
                            const elem = document.createElement("li")
                            elem.classList.add("articlePreview")
                            elem.classList.add(`${Boolean(e["Viewed"]) ? "viewed" : "unviewed"}"`)
                            elem.dataset.articleId = e["ID"]
                            elem.innerHTML = `<a is="a-button" href="/articles/${e["ID"]}">
                                              <div class="title">${sanitiseText(e["Title"])}</div>
                                              <div class="info">
                                                    <div class="change">${getShortNumber(e["TotalViews"])} view${Number(e["TotalViews"]) === 1 ? "" : "s"}</div>
                                                    <div class="change">${e["TotalInfluences"]} affected</div>
                                              </div>
                                          </a>`
                            ul.insertBefore(elem, loadMoreBtn)
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
