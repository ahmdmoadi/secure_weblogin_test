let express = require("express");
let app = express();
let path = require("path");
let crypto = require("crypto");

app.use(express.static(path.join(__dirname, 'public')));
