function buildPageLogin() {
    const prevPath = getCurrentPathWithoutSlash() !== "/login" ? getCurrentPathWithoutSlash() : "/";

    document.body.innerHTML = `<h1>Stock viewer</h1>
        <div class="login-field">
            <h2>Please log in</h2>
            
            <div class="pair">
                <p>Username</p>
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
        const name = document.querySelector('input[type="text"]').value;
        const pw = document.querySelector('input[type="password"]').value;

        if (name.length === 0 || name.length > 32) {
            inftxt.innerHTML = "Please enter a valid name";
            return;
        }
        if (pw.length === 0 || pw.length > 72) {
            inftxt.innerHTML = "Please enter a valid password";
            return;
        }

        fetch(window.location.origin + `/api/users/login?username=${name}&password=${pw}`, {
            method: "POST"
        }).then(r => {
            switch (r.status) {
                case 200:
                    inftxt.innerHTML = "Success.";
                    window.location.href = window.location.origin
                    break;
                case 401:
                    inftxt.innerHTML = "Invalid credentials.";
                    break;
                default:
                    inftxt.innerHTML = "An error occurred!";
                    break;
            }
        })
    })
}