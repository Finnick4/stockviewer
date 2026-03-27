class recentArticlesElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <h2>All articles</h2>
                <p>Loading articles...</p>
            </div>`
        let offset = 0
        fetch(`/api/articles?offset=${offset++}`).then(r => r.json()).then(resp => {
            let html = ""
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

            this.innerHTML = `<ul class="inner">
                        <h2>All articles</h2>
                        ${html}
                        <button class="articlePreview loadMore">Load more articles</button>
                    </ul>
                `
            const loadMoreBtn = this.querySelector("button.loadMore")
            const ul = this.querySelector("ul.inner")
            loadMoreBtn.addEventListener("click", () => {
                console.log("Load more!")

                fetch(`/api/articles?offset=${offset++}`).then(r => r.json()).then(resp => {
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
        })
    }
}



customElements.define('recent-articles', recentArticlesElement);
