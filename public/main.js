/**@type {HTMLInputElement} */
let r_usr = document.querySelector("#username");
/**@type {HTMLInputElement} */
let r_pass = document.querySelector("#password");
/**@type {HTMLButtonElement} */
let r_btn = document.querySelector("#register")
/**@type {HTMLInputElement} */
let l_usr = document.querySelector("#username_l");
/**@type {HTMLInputElement} */
let l_pass = document.querySelector("#password_l");
/**@type {HTMLButtonElement} */
let l_btn = document.querySelector("#login");

(async ()=>{
    async function rng(len=10) {
        return Array.from(new Uint8Array(await crypto.subtle.digest("sha-256", new TextEncoder().encode(Math.floor(Math.PI*Math.random()*1e6).toString(10).substring(0,6)).buffer))).map(d=>{return d.toString(16)}).join("").substring(0,len);
    }

    // r_usr.value = await rng(10);
    // r_pass.value = await rng(16);

    // r_btn.dispatchEvent(new MouseEvent("click"));
})()

let forms = document.querySelectorAll("form").forEach(form=>{
    form.addEventListener("submit", e=>{
        e.preventDefault();
    });
});

r_btn.addEventListener("click", async e=>{
    // let salt = await (await fetch("//localhost/salter", {
    //     method: "POST"
    // })).text();
    let result = await (await fetch("http://localhost/register", {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            "username":r_usr.value,
            "password":r_pass.value
        })
    })).json();
    console.log(`Received message:\n%c${result.msg}\n%cLogging in with:\n username=%c${result.username}%c and\n password=%c${result.password}`,"color: orange;font-family: Segoe UI;font-weight:bold","all:none","color:#7b00ff","all:none","color:red");
    console.dir(result)
})