/**@type {HTMLInputElement} */
let registerUser = document.querySelector("#username");
/**@type {HTMLInputElement} */
let registerPass = document.querySelector("#password");
/**@type {HTMLButtonElement} */
let registerBtn = document.querySelector("#register")
/**@type {HTMLInputElement} */
let loginUser = document.querySelector("#username_l");
/**@type {HTMLInputElement} */
let loginPass = document.querySelector("#password_l");
/**@type {HTMLButtonElement} */
let loginBtn = document.querySelector("#login");
/**@type {HTMLFormElement} */
let registerForm = document.getElementById("register-form");
/**@type {HTMLFormElement} */
let loginForm = document.getElementById("login-form");

(async ()=>{
    async function rng(len=10) {
        return Array.from(new Uint8Array(await crypto.subtle.digest("sha-256", new TextEncoder().encode(Math.floor(Math.PI*Math.random()*1e6).toString(10).substring(0,6)).buffer))).map(d=>{return d.toString(16)}).join("").substring(0,len);
    }

    // r_usr.value = await rng(10);
    // r_pass.value = await rng(16);

    // r_btn.dispatchEvent(new MouseEvent("click"));
})();

// TODO: migrate to using formData instead
// of this crap
registerBtn.addEventListener("click", async e=>{
    let res = await fetch("http://localhost/register", {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            "username":registerUser.value,
            "password":registerPass.value
        })
    });
    let result = await res.json();
    // check status code
    switch (res.status){
        case 400: //
        case 401: // unauhd
        case 403:
        case 422: {
            // TODO: custom alerts
            alert(result.msg);
            break;
        }
        case 200: {
        console.log(`Received message:\n%c${result.msg}\n%cLogging in with:\n username=%c${result.username}%c and\n password=%c${result.password}`,"color: orange;font-family: Segoe UI;font-weight:bold","all:none","color:#7b00ff","all:none","color:red");
            console.dir(result)
            break;
        }
        
    }
        
    
    
});

// login form handeler
loginForm.addEventListener("submit", e=>{
    e.preventDefault();
    let fd = new FormData(loginForm);
    let obj = Object.fromEntries(fd);
    let str = JSON.stringify(obj);
    fetch("http://localhost/login",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: str
    });
});