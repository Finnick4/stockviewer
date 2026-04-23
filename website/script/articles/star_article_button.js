
class starArticleButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.articleid = Number(this.dataset.articleId)
        this.isStarred = this.dataset.isStarred === "true"

        this.classList.add("star")
        this.onclick = () => {
            const isStarred = this.isStarred
            fetch(`/api/articles/${this.articleid}/star`, {
                method: "PUT",
                body: JSON.stringify({
                    result: !isStarred
                })
            }).catch(() => {
                this.updateStatus(isStarred)
            })
            this.updateStatus(!isStarred)
        }

        this.innerHTML = `<img class="icon" src="/icons/star_${this.isStarred ? "filled" : "empty"}.svg" alt="${this.isStarred ? getTranslatedStr("articles.stars.icon_alt_text_starred") : getTranslatedStr("articles.stars.icon_alt_text_unstarred")}" draggable="false">`
    }
    updateStatus(newStatus) {
        this.isStarred = newStatus === "true" || newStatus === true
        this.title = this.isStarred ? getTranslatedStr("articles.stars.icon_alt_text_starred") : getTranslatedStr("articles.stars.icon_alt_text_unstarred")
        this.innerHTML = `<img class="icon" src="/icons/star_${this.isStarred ? "filled" : "empty"}.svg" alt="${this.isStarred ? getTranslatedStr("articles.stars.icon_alt_text_starred") : getTranslatedStr("articles.stars.icon_alt_text_unstarred")}" draggable="false">`
    }
}

customElements.define('star-article-button', starArticleButtonElement, {extends: "button"});
