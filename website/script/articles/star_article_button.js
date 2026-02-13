
class starArticleButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.articleid = this.getAttribute("data-articleid")

        this.modalhtml = `
            <h1>This is not yet implemented!</h1>
            <p>In the future you will be able to star article ${this.articleid} with this button!</p>
        `
        this.classList.add("edit")
        this.onclick = () => createModal(this.modalhtml)

        this.innerHTML = `<img class="icon" src="/icons/star_empty.svg" alt="give star" draggable="false">`
    }
}

customElements.define('star-article-button', starArticleButtonElement, {extends: "button"});
