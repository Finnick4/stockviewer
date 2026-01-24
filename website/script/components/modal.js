
let modalCount = 0

function createModal(html) {
    let modal = document.createElement("div")
    modal.className = "modal"
    modal.id = "modal-" + modalCount
    modal.innerHTML = `<div class="outer">
        <span class="closeBtn" onClick="closeModal('${modal.id}')">&times;</span>
        <div class="content">${html}</div>
    </div>`
    modal.addEventListener("click", x => {
        if (x.target === modal) {
            closeModal(modal.id)
        }
    })
    document.body.insertBefore(modal,document.body.childNodes[0]);
    modalCount++
    return modal.id
}


function closeModal(id) {
    document.body.removeChild(document.getElementById(id))
}
