// nothing here yet

(async ()=>{
    async function rng(len=10) {
        return Array.from(new Uint8Array(await crypto.subtle.digest("sha-256", new TextEncoder().encode(Math.floor(Math.PI*Math.random()*1e6).toString(10).substring(0,6)).buffer))).map(d=>{return d.toString(16)}).join("").substring(0,len);
    }

    // r_usr.value = await rng(10);
    // r_pass.value = await rng(16);

    // r_btn.dispatchEvent(new MouseEvent("click"));
})();



