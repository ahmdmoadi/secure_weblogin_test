# client
- create pass
- fetch salt via /salter
- send password concated with salt via /register
- /register lookups in MySQL db to find usr
    - usr found->exit with:
        - res.status(400).send("User alr exs")
    - usr new:
- insert uname,salt,hash in MySQL db
- res.status(200).send("User Registered Successfully")

- user tries to access /
- server checks
- server redirs to /login