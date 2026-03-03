function buildIndividualArticlePage(id) {
    if (isNaN(id) || id <= 0) {
        window.history.pushState(null, null, `${window.location.origin}/articles`);
        router("/articles");
    }

    const main = `
                        <div class="titlebar">
                            <div class="info">
                                <div class="creationDate change"></div>
                                <div class="author change"></div>
                            </div>
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
    const author = document.querySelector("main div.titlebar .author")
    const createdAt = document.querySelector("main div.titlebar .creationDate")

    fetch(`/api/articles?id=${id}`).then(r => r.json()).then(resp => {
        const data = resp["Data"]
        if (data["AuthorID"] !== "") {
            author.innerHTML = sanitiseText(data["AuthorDisplayName"])
        }
        const creationDate = new Date(data["TimeCreated"])
        createdAt.innerHTML = Intl.DateTimeFormat("en", {
            month: 'long',
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(creationDate)

        title.innerHTML = data["Title"]
        article.innerHTML = data["Content"] === "" ? `<i>This article doesn't have a body (yet).<br>
            If you have the permission to do so, you can fix it by editing this article!</i>` : ("<p>" + sanitiseText(data["Content"]).replaceAll("\n", "</p><p>") + "</p>")
    })
}