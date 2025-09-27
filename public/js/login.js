/**@type {HTMLFormElement} */
let loginForm = document.getElementById("login-form");

// login form handeler
loginForm.addEventListener("submit", async e=>{
    e.preventDefault();
    let redirectPath = new URLSearchParams(location.search).get("redirect") || "/";
    let fd = new FormData(loginForm);
    fd.append("redirect", redirectPath)
    let obj = Object.fromEntries(fd);
    let str = JSON.stringify(obj);
    let res = await fetch("http://localhost/login",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: str
    });
    if(res.ok){
        location.replace(redirectPath);
    }
});