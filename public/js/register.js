/**@type {HTMLFormElement} */
let registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async e=>{
    e.preventDefault();
    let redirectPath = new URLSearchParams(location.search).get("redirect") || "/";
    let fd = new FormData(registerForm);
    fd.append("redirect", redirectPath)
    let obj = Object.fromEntries(fd);
    let str = JSON.stringify(obj);
    console.log(str);
    let res = await fetch("http://localhost/register",{
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