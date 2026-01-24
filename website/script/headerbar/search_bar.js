
class searchBarElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<input type="text" placeholder="Search...">`
    }
}

customElements.define('search-bar', searchBarElement);
