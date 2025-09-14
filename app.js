// IMPORTS
let express = require("express");
let session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
let app = express();
let path = require("path");
const {pool, findUser, insertUser, auth, getUserData} = require("./db");
let {getClientIP, handleUsername} = require("./util");
let {rateLimit} = require("express-rate-limit");
require('./envr');

// MIDDLEWARES
app.use(require("cors")({origin: "*"}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONSTANTS
const PORT = process.env.SERVER_PORT;

// CONFIG
// 1 for ngnix/heroku/vercel
// false 4 now
app.set('trust proxy', false);
// login rate limiter to prevent bruteforce
const loginLimiter = rateLimit({
    windowMs: 1000*60*15,
    limit: 10,
    message: {error: "Too many login attempts. Please try again later."},
    standardHeaders: true,
    legacyHeaders: false
});
// session management
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
// handle user registeration
app.post("/register", async (req, res) => {
    console.log(req.body);
    let {username, password} = req.body;
    
    let userFound = await findUser(username);

    if(!userFound) {
        let valid = handleUsername(username);
        if(!valid) return res.status(422).json({
            error: "Invalid username: username containes blocked words/phrases."
        });
        insertUser(username, password);
        res.status(200).send({
            msg: "User Created Successfully.",
            _cecode: "PIZZA"
        });
    } else {
        res.status(409).send({
            error: "Username already exists!"
        })
    }
   
});
// login get req
app.get("/login", (req, res) => {
    // check if signed in
    if(req.session.user) {
        let path = req.query.redirect || "/";
        console.log(req.query,path);
        return res.status(200).redirect(path);
    }
    res.sendFile(path.join(__dirname,"public","login.html"));
});
// handle user login+rate limiter
app.post('/login', loginLimiter,async (req, res) => {
    // if(req.session.user) return res.redirect(req.query.redirect);
    console.log("-loginbegin-\nlogin requested");
    const {username,password} = req.body;
    if(!username||!password) {
        console.log("oof, no uname/pass");
        return res.status(400).json({
        error: "Bad request: malformed input!"
    })}
    let userFound = findUser(username);
    if(!userFound){
        console.log("usr doesnt exist");
        return res.status(401).json({
        error: "User not found"
        });
    }
    console.log(`hmm, seems like ${username} is here!`);
    let authd = await auth(username,password);
    if(!authd){
        console.log("oof, guess not! shoo!");
        return res.status(401).json({
        msg: "Authentication Error!",
        _cecode: "CANTENTERMATE"
        });
    }
    req.session.user = {id:username}
    if(req.session.user) {
        console.log("they're in! welcome welcome!");
        res.status(200).json({
            msg: "How did we get here?! Welcome!",
            _cecode: "PARTY"
        })
    }
});

app.get("/profile", (req, res) => {
    if (!req.session.user) {
        // Preserve intended path
        const redirectPath = encodeURIComponent(req.originalUrl); 
        return res.redirect(`/login?redirect=${redirectPath}`);
    }
    res.status(200).sendFile(path.join(__dirname, "public", "profile.html"))
});

app.get('/user/:userid', async (req, res) => {
  const id = req.params.userid;
  if(await findUser(id)) {
    let userData = await getUserData(id);
    res.status(200).send(userData);
  } else {
    res.sendFile(path.join(__dirname, "public", "usernotfound.html"))
  }
});


app.get("/", (req,res)=>{
    // console.log(req.session.user+" connected");
    // if(!req.session.user) return res.status(401).redirect("/login");
    // finally serve
    //   res.sendFile(path.join(__dirname, 'public', 'main.html'));
    res.status(200).json({ip: getClientIP(req),loggedIn:!!req.session.user});
});


app.post("/logout", (req, res)=>{
    req.session.destroy(err => {
        if(err) return res.status(500).send("Error logging out!");
        res.clearCookie('sid');
        console.log("baseUrl",req.baseUrl??null)
    });
});

function salter(len) {
    return Math.floor(Math.random()*Math.PI*1e16).toString(16).substring(0,(len<=16&&len>0&&typeof len==="number")?len:16);
}

app.listen(80);

console.log("Server started on port "+PORT);