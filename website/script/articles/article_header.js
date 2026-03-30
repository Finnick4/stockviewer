class articleHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <h1></h1>
            <div class="subtitle">
                <div class="creationInfo">
                    <div class="creationDate change"></div>
                    <div class="author change"></div>
                </div>
                <div class="articleReception">
                    <div class="change views"></div>
                    <div class="change hearts"></div>
                </div>
            </div>
        `
        this.elemCreatedAt = this.querySelector("div.creationDate")
        this.elemAuthor = this.querySelector("div.author")
        this.elemTitle = this.querySelector("h1")
        this.elemViews = this.querySelector("div.views")
        this.elemHearts = this.querySelector("div.hearts")

        this.titleVal = this.dataset.articleTitle === undefined ? getTranslatedStr("articles.unknown_title") : sanitiseText(this.dataset.articleTitle)
        this.authorName = this.dataset.authorName === undefined ? getTranslatedStr("articles.unknown_author") : sanitiseText(this.dataset.authorName)
        this.creationDate = this.dataset.creationDate === undefined ? new Date(1) : new Date(sanitiseText(this.dataset.creationDate))
        this.views = this.dataset.views === undefined ? 0 : Number(sanitiseText(this.dataset.views))
        this.hearts = this.dataset.hearts === undefined ? 0 : Number(sanitiseText(this.dataset.hearts))

        this.update()
    }
    update() {
        this.elemCreatedAt.innerHTML = Intl.DateTimeFormat(langCode, {
            month: 'long',
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(this.creationDate)
        this.elemTitle.innerHTML = this.titleVal
        this.elemAuthor.innerHTML = this.authorName
        this.elemHearts.innerHTML = `&#9825; ${getShortNumber(this.hearts)}`
        this.elemViews.innerHTML = `&#128065; ${getShortNumber(this.views)}`
    }
}

customElements.define('article-header', articleHeader);

