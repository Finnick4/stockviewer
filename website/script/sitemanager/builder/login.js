function buildPageLogin() {
    document.body.innerHTML = `<h1>Stock Viewer</h1>
        <div class="login-field">
            <h2>Please log in</h2>
            
            <div class="pair">
                <p>User tag</p>
                <input type="text">            
            </div>
            
            <div class="pair">
                <p>Password</p>
                <input type="password">            
            </div>
                        
            <div class="pair">
                <div class="info"></div>
                <button class="primary">Log in</button>
            </div>
        </div>
    `

    document.querySelector("button.primary").addEventListener("click", event => {
        const inftxt = document.querySelector(".info");
        inftxt.innerHTML = "Checking credentials.";
        const tag = document.querySelector('input[type="text"]').value;
        const pw = document.querySelector('input[type="password"]').value;

        if (tag.length === 0 || tag.length > 32) {
            inftxt.innerHTML = "Please enter a valid tag";
            return;
        }
        if (pw.length === 0 || pw.length > 72) {
            inftxt.innerHTML = "Please enter a valid password";
            return;
        }

        fetch(window.location.origin + `/api/users/login?tag=${tag}&password=${pw}`, {
            method: "POST"
        }).then(r => {
            switch (r.status) {
                case 200:
                    inftxt.innerHTML = "Success.";
                    window.history.pushState(null, null, `${window.location.origin}`);
                    router();
                    break;
                case 401:
                    inftxt.innerHTML = "Invalid credentials.";
                    break;
                case 403:
                    inftxt.innerHTML = "You have to change your password.";
                    showChangePasswordModal();
                    break;
                default:
                    inftxt.innerHTML = "An error occurred!";
                    break;
            }
        })
    })
}