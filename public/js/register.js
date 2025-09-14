/**@type {HTMLInputElement} */
let registerUser = document.querySelector("#username");
/**@type {HTMLInputElement} */
let registerPass = document.querySelector("#password");
/**@type {HTMLButtonElement} */
let registerBtn = document.querySelector("#register");
/**@type {HTMLFormElement} */
let registerForm = document.getElementById("register-form");

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