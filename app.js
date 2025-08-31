let express = require("express");
const mysql = require("mysql2/promise");
const argon2 = require("argon2");
let app = express();
let path = require("path");
let crypto = require("crypto");
const fs = require('fs');
const { constants } = crypto;
const bodyParser = require("body-parser");

app.use(require("cors")({origin: "*"}))
//id_ed25519

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const privateKeyPem = fs.readFileSync('./pvt/swt'); // keep safe!

app.post("/getkey", (req, res) => {
    let {username, password} = req.body;
   res.send({
    msg: `Received, dear [${username}]`,
    username,
    password
   });
   console.log(req.body);
});

app.listen(80);

console.log("Server started on port 80.")