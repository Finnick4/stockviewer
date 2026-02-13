class recentArticlesElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="inner">
                <h2>All articles</h2>
                <p>Loading articles...</p>
            </div>`

        fetch("/api/articles?offset=0").then(r => r.json()).then(resp => {
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

            const loadMore = () => {
                console.log("Load more!!")
            }

            this.innerHTML = `<ul class="inner">
                        <h2>All articles</h2>
                        ${html}
                        <button class="articlePreview loadMore">Load more</button>
                    </ul>
                `

            this.querySelector("button.loadMore").addEventListener("click", () => {
                console.log("Load more!")
            })
        })
    }
}



customElements.define('recent-articles', recentArticlesElement);
