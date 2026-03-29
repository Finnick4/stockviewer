
class searchBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<input type="text" placeholder="${lang.header.search.placeholder}">`
    }
}

customElements.define('search-bar', searchBarElement);
