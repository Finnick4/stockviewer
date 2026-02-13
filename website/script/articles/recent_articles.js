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
                html += `<li class="articlePreview" data-article-id="${e["Id"]}">
                            <a is="a-button" href="/articles/${e["Id"]}">
                                <div class="title">${e["Title"]}</div>
                                <div>
                                    <div class="change">0 affected</div>
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
                        elem.dataset.articleId = e["Id"]
                        elem.innerHTML = `<a is="a-button" href="/articles/${e["Id"]}">
                                              <div class="title">${e["Title"]}</div>
                                              <div>
                                                <div class="change">0 affected</div>
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
