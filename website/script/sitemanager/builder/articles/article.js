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
                        <div class="effectInfo"></div>
                        `;
    setMainBodyHTML(main);

    const article = document.querySelector("main div.article")
    const articleTitleElem = document.querySelector("main article-header")
    const effectInfoElem = document.querySelector("main div.effectInfo")

    fetch(`/api/articles/${id}`).then(r => r.json()).then(resp => {
        if (resp["Code"] === 404) {
            setMainBodyHTML(`<h1>This article does not exist!</h1>`);
            return
        }

        const data = resp["Data"]
        if (data["AuthorID"] !== "") {
            articleTitleElem.authorName = sanitiseText(data["AuthorDisplayName"])
        }
        articleTitleElem.creationDate =  new Date(data["TimeCreated"])
        articleTitleElem.titleVal = data["Title"]
        articleTitleElem.views = data["TotalViews"]
        articleTitleElem.update()

        article.innerHTML = data["Content"] === "" ? `<i>This article doesn't have a body (yet).<br>
            If you have the permission to do so, you can fix it by editing this article!</i>` : parseStyle(data["Content"])

        if (data["Influences"] !== null) {
            const stocks = data["Influences"].map(influence => influence["StockID"])

            const affectedStocksElem = new affectedStocks()
            affectedStocksElem.setData(stocks, resp["Data"]["Influences"])
            effectInfoElem.appendChild(affectedStocksElem)
        }
    })
}