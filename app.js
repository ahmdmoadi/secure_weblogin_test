let express = require("express");
let session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
let app = express();
let path = require("path");
const {pool, findUser, insertUser, auth} = require("./db");
require('./envr');
const PORT = process.env.SERVER_PORT;

app.use(require("cors")({origin: "*"}))
//id_ed25519

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.use(session({
  key: 'sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true in production w/ HTTPS
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

app.post("/register", async (req, res) => {
    console.log(req.body);
    let {username, password} = req.body;
    
    let userFound = await findUser(username);

    if(!userFound) {
        insertUser(username, password);
        res.status(200).send({
            msg: "User Created Successfully.",
            _cecode: "PIZZA"
        });
    } else {
        res.status(403).send({
            msg: "Username exists!",
            _cecode: "TAKENLOL"
        })
    }
   
});

app.post('/login', (req, res) => {
    const {username,password} = req.body;
    let userFound = findUser(username);
    if(!userFound){
        res.status(401).json({
        msg: "User not found",
        _cecode: "IMLOST"
        });
        return;
    }
    let authd = auth(username,password);
    if(!userFound){
        res.status(401).json({
        msg: "Authentication Error!",
        _cecode: "CANTENTERMATE"
        });
        return
    }
    req.session.user = {id:username}
    res.status(200).json({
        msg: "How did we get here?! Welcome!",
        _cecode: "PARTY"
    })
});

app.get("/", (req,res)=>{
    console.log(req.session.user+" connected");
    if(!req.session.user) return res.status(401).redirect("/login")
    // finally serve
      res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post("/logout", (req, res)=>{
    req.session.destroy(err => {
        if(err) return res.status(500).send("Error logging out!");
        res.clearCookie('sid');
        res.redirect('/login.html')
    });
});

function salter(len) {
    return Math.floor(Math.random()*Math.PI*1e16).toString(16).substring(0,(len<=16&&len>0&&typeof len==="number")?len:16);
}

app.listen(80);

console.log("Server started on port "+PORT);