
class userManagerElement extends HTMLElement {
    connectedCallback() {
        this.dropdownid = createDropdown(`
        <a is="a_link" class="btn" href="/user-settings">Account Settings</a>
        <a is="a_link" class="btn" href="/admin">Administration</a>
        <button onclick="logout()">Log out</button>
        `)
        this.innerHTML = `
        <button popovertarget="${this.dropdownid}" class="usermanager" style="anchor-name: --anchor-${this.dropdownid};">
            <div class="name">loading...</div>
            <img class="icon" src="/icons/user.svg" alt="user icon" draggable="false">
        </button>`
        userInformation.writeName(name => {
            this.querySelector("div.name").innerHTML = name
        })
    }
    disconnectedCallback() {
        deleteDropdown(this.dropdownid)
    }
}


customElements.define('user-manager', userManagerElement);

