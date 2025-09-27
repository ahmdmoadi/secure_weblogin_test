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

////////////
// CONFIG //
////////////

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

/////////////////
// MIDDLEWARES //
/////////////////
// Put this BEFORE express.static (chatgpt code)
app.get("/:page.html", (req, res) => {
  let page = req.params.page;

  // Define mappings
  const routes = {
    main: "/",
    profile: "/profile",
    logout: "/logout",
    register: "/register",
    usernotfound: "/404",
    "404": "/404"
  };

  if (routes[page]) {
    return res.redirect(302, routes[page]);
  }

  // If no mapping, let express.static handle it
  res.sendFile(path.join(__dirname, "public", `${page}.html`));
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(require("cors")({origin: "*"}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
///////////////
// CONSTANTS //
///////////////
const PORT = process.env.SERVER_PORT;

////////////
// ROUTES //
////////////

app.get("/status", (req,res)=>{
    res.json({
        status: "logged"+(!!req.session.user?" in":" out"),
        loggedInUser: !!req.session.user?req.session.user.id:"N/A"
    });
})

app.get("/register", (req, res) => {
    if(req.session.user) {
        let path = req.query.redirect || "/";
        console.log(req.query,path);
        return res.redirect(path);
    }
    res.sendFile(path.join(__dirname, "public","register.html"))
});

// handle user registeration
app.post("/register", async (req, res) => {
    if(req.session.user){
        res.status(409).json({
            error: "Already Logged In"
        });
    }
    console.log(req.body);
    let {username, password} = req.body;
    
    let userFound = await findUser(username);

    if(!userFound) {
        let isIllegal = handleUsername(username);
        if(isIllegal) {
            console.log("illegal creds", isIllegal);
            return res.status(422).json({
            error: "Invalid username: username containes blocked words/phrases."
            })
        };
        insertUser(username, password);
        req.session.user = {
            id: username
        }
        res.redirect("/")
    } else {
        res.status(409).json({
            error: "Conflict"
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
        console.error("usr doesnt exist");
        return res.status(401).json({
        error: "User not found"
        });
    }
    console.log(`hmm, seems like ${username} is here!`);
    let authd = await auth(username,password);
    if(!authd){
        console.error("oof, guess not! shoo!");
        return res.status(401).json({
        msg: "Authentication Error!"
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

app.post("/info",new Function());

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
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
    // res.status(200).json({ip: getClientIP(req),loggedIn:!!req.session.user});
});


app.post("/logout", (req, res)=>{
    req.session.destroy(err => {
        if(err) {
            console.error("Client logout failure!");
            return res.status(500).json({
                error: "couldn't logout!"
            })
        };
        res.clearCookie('sid');
        // console.log("baseUrl",req.baseUrl??null);
    });
});
app.get("/logout", (req, res)=>{
    if(!req.session.user){
        res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "public", "logout.html"));
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "404.html"))
});

app.listen(80);

console.log("Server started on port "+PORT);