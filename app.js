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

app.post("/register", async (req, res) => {
    let {username, password} = req.body;
    let salt = salter();
    let hashedPass = await argon2.hash(salt+password, {type:argon2.argon2id});
    let c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'swt',
        password: "789"+"456Ah@indome@"
    });
    try {
        let doExists = await c.execute(`SELECT EXISTS(SELECT * FROM users WHERE username = ${username});`);
        console.log("Exists?",doExists)
    } catch (err) {
        console.error("Row doesn't exist. Creating..");
        try {
            await c.execute("INSERT INTO users VALUES (?,?,?);",[username,salt,hashedPass]);
        } catch (crerr) {
            console.error("Couldn't create user:", username, "Reason:", crerr);
        }
    }
    res.send({
    msg: `Registering with username [${username}] and obfs. pass [${hashedPass}]`,
    username,
    password
   });
   console.log({...req.body, hashedPass});
   c.end();
});

function salter(len) {
    return Math.floor(Math.random()*Math.PI*1e16).toString(16).substring(0,(len<=16&&len>0&&typeof len==="number")?len:16);
}

app.listen(80);

console.log("Server started on port 80.")