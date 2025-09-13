const { salter } = require("./util");
const mysql = require("mysql2/promise");
const argon2 = require("argon2");

require("./envr");

let pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    connectionLimit: 10
});

async function findUser(username) {
    let [rows] = await pool.query(`SELECT EXISTS(SELECT * FROM users WHERE username = ?) AS userExists;`,[username]);

    let doExists = rows[0].userExists;

    return !!doExists;
}

async function auth(username, password) {
    const exists = await findUser(username);
    if(!exists)return false;
    let [rows] = await pool.query("SELECT salt,pw_hash FROM users WHERE username = ?", [username]);
    let {pw_hash, salt} = rows[0];
    return argon2.verify(pw_hash, salt+password);
}

async function insertUser(username, password) {
    let salt = salter();
    let hashedPass = await argon2.hash(salt+password, {type:argon2.argon2id});
    try {
        await pool.query("INSERT INTO users VALUES (?,?,?);",[username,salt,hashedPass]);
        res.send({
        msg: `Registering with username [${username}] and obfs. pass [${hashedPass}]`,
        username,
        password
    });
    } catch (crerr) {
        console.error("Couldn't create user:", username, "Reason:", crerr);
    }
}

module.exports = {
    pool, findUser, insertUser, auth
}