function buildPageLogin() {
    document.body.innerHTML = `<h1>Stock Viewer</h1>
        <div class="login-field">
            <h2>${getTranslatedStr("login.title")}</h2>
            
            <div class="pair">
                <p>${getTranslatedStr("login.tag")}</p>
                <input type="text">            
            </div>
            
            <div class="pair">
                <p>${getTranslatedStr("login.password")}</p>
                <input type="password">            
            </div>
                        
            <div class="pair">
                <div class="info"></div>
                <button class="primary">${getTranslatedStr("login.log_in")}</button>
            </div>
        </div>
    `
    document.body.className = "login"
    const primaryBtn = document.querySelector("button.primary")

    document.querySelectorAll("input").forEach(inpt => inpt.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            primaryBtn.click()
        }
    }))

    primaryBtn.addEventListener("click", event => {
        const inftxt = document.querySelector(".info");
        inftxt.innerHTML = getTranslatedStr("login.checking");
        const tag = document.querySelector('input[type="text"]').value;
        const pw = document.querySelector('input[type="password"]').value;

        if (!verifyUserTag(tag, () => {})) {
            inftxt.innerHTML = getTranslatedStr("login.err_tag");
            return;
        }
        if (!plausiblePassword(pw)) {
            inftxt.innerHTML = getTranslatedStr("login.err_pw");
            return;
        }

        fetch(window.location.origin + `/api/users/login`, {
            method: "POST",
            body: JSON.stringify({
                tag: tag,
                password: pw
            })
        }).then(r => {
            switch (r.status) {
                case 200:
                    inftxt.innerHTML = getTranslatedStr("login.success");
                    window.history.pushState(null, null, `${window.location.origin}`);
                    initialiseUserInfo().then(() => router())
                    break;
                case 401:
                    inftxt.innerHTML = getTranslatedStr("login.err_invalid_credentials");
                    break;
                case 403:
                    inftxt.innerHTML = getTranslatedStr("login.err_pw_change");
                    showChangePasswordModal();
                    break;
                default:
                    inftxt.innerHTML = getTranslatedStr("login.err_generic");
                    break;
            }
        })
    })
}