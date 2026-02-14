function buildIndividualArticlePage(id) {
    if (isNaN(id) || id <= 0) {
        window.history.pushState(null, null, `${window.location.origin}/articles`);
        router("/articles");
    }

    const main = `
                        <div class="titlebar">
                            <div></div>
                            <h1>Loading name...</h1>
                            <nav>
                                <button is="star-article-button" data-articleid="${id}"></button>
                                <button is="edit-article-button" data-articleid="${id}"></button>
                            </nav>
                        </div>
                        <div class="article">
                            Loading article...
                        </div>
                        `;
    setMainBodyHTML(main);

    const article = document.querySelector("main div.article")
    const title = document.querySelector("main div.titlebar h1")

    fetch(`/api/articles?id=${id}`).then(r => r.json()).then(resp => {
        const data = resp["Data"]
        title.innerHTML = data["Title"]
        article.innerHTML = data["Content"] === "" ? `<i>This article doesn't have a body (yet).<br>
            If you have the permission to do so, you can fix it by editing this article!</i>` : ("<p>" + sanitiseText(data["Content"]).replaceAll("\n", "</p><p>") + "</p>")
    })
}