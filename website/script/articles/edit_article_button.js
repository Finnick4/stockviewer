
class editArticleButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.articleid = this.getAttribute("data-articleid")

        this.modalhtml = `
            <h1>This is not yet implemented!</h1>
            <p>In the future you will be able to edit article ${this.articleid} here!</p>
        `
        this.classList.add("edit")
        this.onclick = () => createModal(this.modalhtml)

        this.innerHTML = `<img class="icon" src="/icons/edit.svg" alt="edit" draggable="false">`
    }
}

customElements.define('edit-article-button', editArticleButtonElement, {extends: "button"});
