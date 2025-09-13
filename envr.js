const {readFileSync} = require("fs");

const envfile = readFileSync(".env").toString();

const lines = envfile.replace(/\r/g,"").split(/\n/i);

lines.forEach(line => {
    const [k, v] = line.split("=");
    process.env[k] = v;
});