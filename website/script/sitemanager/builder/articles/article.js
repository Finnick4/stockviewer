function buildIndividualArticlePage(id) {
    if (isNaN(id) || id <= 0) {
        window.history.pushState(null, null, `${window.location.origin}/articles`);
        router("/articles");
    }

    const main = `
                        <div class="titlebar">
                            <div></div>
                            <article-header></article-header>
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
    const articleTitleElem = document.querySelector("main article-header")

    fetch(`/api/articles?id=${id}`).then(r => r.json()).then(resp => {
        const data = resp["Data"]
        if (data["AuthorID"] !== "") {
            articleTitleElem.authorName = sanitiseText(data["AuthorDisplayName"])
        }
        articleTitleElem.creationDate =  new Date(data["TimeCreated"])
        articleTitleElem.title = data["Title"]
        articleTitleElem.update()

        article.innerHTML = data["Content"] === "" ? `<i>This article doesn't have a body (yet).<br>
            If you have the permission to do so, you can fix it by editing this article!</i>` : parseStyle(data["Content"])
    })
}