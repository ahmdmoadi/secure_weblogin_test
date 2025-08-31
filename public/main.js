/**@type {HTMLInputElement} */
let r_usr = document.querySelector("#username");
/**@type {HTMLInputElement} */
let r_pass = document.querySelector("#password");
/**@type {HTMLButtonElement} */
let r_btn = document.querySelector("#register")
/**@type {HTMLInputElement} */
let l_use = document.querySelector("#username_l");
/**@type {HTMLInputElement} */
let l_pass = document.querySelector("#password_l");
/**@type {HTMLButtonElement} */
let l_btn = document.querySelector("#login");

let forms = document.querySelectorAll("form").forEach(form=>{
    form.addEventListener("submit", e=>{
        e.preventDefault();
    });
});

r_btn.addEventListener("click", async e=>{
    let result = await (await fetch("http://localhost/getkey", {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            "username":r_usr.value,
            "password":r_pass.value
        })
    })).json();
    console.log(`received msg:\n[${result.msg}]\nLogging in with username [${result.username}] and password [${result.password}]`);
})