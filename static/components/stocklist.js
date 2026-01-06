class stocklistAll extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="stocklist">
        <h2>All stocks</h2>
        <div class="stockoverview">
            <div class="stockname">Lorem Ipsum</div>
            <div>
                <div class="change positive">+10</div>
                <div class="change positive">+1%</div>
            </div>
        </div>
        <div class="stockoverview">
            <div class="stockname">Lorem Ipsum</div>
            <div>
                <div class="change positive">+100</div>
                <div class="change positive">+0.1%</div>
            </div>
        </div>
        <div class="stockoverview">
            <div class="stockname">Lorem Ipsum</div>
            <div>
                <div class="change negative">-100</div>
                <div class="change negative">-0.1%</div>
            </div>
        </div>
        <div class="stockoverview">
            <div class="stockname">WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW</div>
            <div>
                <div class="change negative">-100</div>
                <div class="change negative">-0.1%</div>
            </div>
        </div>
        <div class="stockoverview">
            <div class="stockname">Senatus Populusque Romanum</div>
            <div>
                <div class="change negative">-100</div>
                <div class="change negative">-0.1%</div>
            </div>
        </div>
    </div>`
    }
}

customElements.define('stocklist-all', stocklistAll);
