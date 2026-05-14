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
                                <button is="star-article-button" data-article-id="${id}"></button>
                                ${userInfo.hasAnyEditArticlePermissions ? `<button is="edit-article-button" data-article-id="${id}"></button>` : ""}
                            </nav>
                        </div>
                        <div class="article">
                            ${getTranslatedStr("articles.individual_page.loading")}
                        </div>
                        <div class="effectInfo"></div>
                        `;
    setMainBodyHTML(main);

    const article = document.querySelector("main div.article")
    const articleTitleElem = document.querySelector("main article-header")
    const effectInfoElem = document.querySelector("main div.effectInfo")

    fetch(`/api/articles/${id}`).then(r => r.json()).then(resp => {
        if (resp["Code"] === 404) {
            setMainBodyHTML(`<h1>${getTranslatedStr("articles.individual_page.err_not_exist")}</h1>`);
            return
        }

        const data = resp["Data"]
        if (data["AuthorID"] !== "") {
            articleTitleElem.authorName = sanitiseText(data["AuthorDisplayName"])
        }
        articleTitleElem.creationDate =  new Date(data["TimeCreated"])
        articleTitleElem.titleVal = data["Title"]
        articleTitleElem.views = data["TotalViews"]
        articleTitleElem.stars = data["TotalStars"]
        articleTitleElem.update()

        document.querySelector("main button.star").updateStatus(data["Starred"])

        article.innerHTML = data["Content"] === "" ? `<i>${getTranslatedStr("articles.individual_page.empty_content_notice")}<br>
            ${getTranslatedStr("articles.individual_page.empty_content_hint")}</i>` : parseStyle(data["Content"])

        if (data["Influences"] !== null) {
            const stocks = data["Influences"].map(influence => influence["StockID"])

            const affectedStocksElem = new affectedStocks()
            affectedStocksElem.setData(stocks, resp["Data"]["Influences"])
            effectInfoElem.appendChild(affectedStocksElem)
        }
    })
}