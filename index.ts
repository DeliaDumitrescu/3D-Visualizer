import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import { use } from 'passport';
let ejs = require('ejs');

// rest of the code remains same
const app = express();
const PORT = 8080;

var validator = require('validator');

// SQLITE PART
const sqlite3 = require('sqlite3').verbose();

var dir = './database';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

let sqldb = new sqlite3.Database('./database/users.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err: any) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');

  sqldb.serialize(() => {

    sqldb.run(`CREATE TABLE IF NOT EXISTS "users" (
      "username"	TEXT NOT NULL UNIQUE,
      "email"     TEXT NOT NULL,
      "phone"     TEXT NOT NULL,
      "address"   TEXT NOT NULL,
      "password"	TEXT NOT NULL,
      "sex" TEXT NOT NULL
    );`)
  
    console.log("sqlite db init'd")
  });
});

// TODO : use this to register users.
function insertUser(username: string, email: string, phone: string, address: string, password: string, sex: string, cb : (err : Error | null) => any){
  sqldb.serialize(() => {
		sqldb.run(`INSERT INTO "main"."users"("username", "email", "phone", "address","password", "sex") VALUES (?,?,?,?,?,?);`, username, email, phone, address, password, sex, function (err : any){
			if (err) {
				console.log (err)
        cb(err)
			} else{
        cb(null)
      }
		})
	});
}

function findUser(username: any, cb: any){
  sqldb.serialize(() => {
		sqldb.all(`SELECT * FROM users WHERE username=? LIMIT 1;`, username, (err: any, rows : any) => {
		  if (err) {
        console.error(err.message);
        cb("error sqlite", "error sqlite")
		  }
		  else {
        //console.log(rows);
        //console.log(rows.length);
        if (rows.length == 1) {
          cb(null, rows[0]);
        }
        else {
          cb("error : not registered", "not registered");
          // console.log("not reg")
        }
		  }
		});
	});
}
// END OF SQLITE PART




// PASSPORT JS PART
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var session = require('express-session');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');

passport.serializeUser(function(user :any, done :any) {
  //console.log("serialization")
  //console.log(JSON.stringify(user))
  done(null, JSON.stringify(user));
});

passport.deserializeUser(function(user :any, done :any) {
  //console.log("Deserialization")
  //console.log(user)
  done(null, JSON.parse(user)); // TODO : handle deserialization if parsing fails ( weird cookie input )
});

app.use(cookieParser('secret'));
app.use(cookieSession({signed:false}));
app.use(session({ secret: 'anything' }));

app.use(require('body-parser').urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.use(express.static('public'))

passport.use(new Strategy(
  function(username : any, password : any, cb : any) {
    findUser(username, function(err : any, user : any) {
      if (err) { return cb(null); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login'})
);

app.get('/login', (req,res) => {
  let data = {
    formButtonName: "Login",
    username: null,
    emailMessage: "",
    emailValue: "",
    usernameMessage: "",
    usernameValue: "",
    phoneMessage: "",
    phoneValue: "",
    addressMessage: "",
    addressValue: "",
    sexMessage: "",
    sexValue: "",
    passwordMessage: "",
    passwordValue: ""
  }
  res.render("pages/login", data)
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// This simply returns a fileupload html form on GET /upload
app.get('/upload', (req,res) => {
  // TODO: move this into an ejs partial.
  // res.send('<form action="fileupload" method="post" enctype="multipart/form-data"><input type="file" name="filetoupload"><br><input type="submit"></form>');
  let data = {
    formButtonName: "Upload",
    username: null
  }
  res.render("pages/upload", data);
})

app.post('/fileupload', (req,res) => {
  if(!req.user) {
    res.send("You are not logged in.");
    return;
  }
  var form = new formidable.IncomingForm();
  // When formidable parses files, they are stored in a temp folder.
  // So they have to be moved from the oldPath to the newPath
  // with fs.rename
  form.parse(req, function (err, fields, files) {
    var oldpath = ((files.filetoupload as unknown) as formidable.File ).path;

    // Uploaded filename. Weird casting neccessary because formidable type definitions are wrong.
    var filename = ((files.filetoupload as unknown) as formidable.File ).name;

    // TODO: add user folders in /public/data/... based on UUID
    // This can only be solved once the login system is in place
    // Use the parsed info created upstream and bound to 'req'.
    // Like : newpath = './public/data/' + req.uuid + ....
    // eg : newpath = './public/data/231239-123921/banana.glb'
    let t : any = req.user
    let userDir = './public/data/' + t.username;
    if (!fs.existsSync(userDir)){
      fs.mkdirSync(userDir);
    }

    var newpath = userDir + "/" + filename;

    //console.log( oldpath + " ->>> " + newpath)
    console.log("File uploaded in " + newpath)

    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      // TODO: reply with an ejs page to let the user know the upload was successful.
      res.write('Successfully uploaded!');
      res.end();
    });
    
  });
})

app.get('/register', (req, res) => {
  let data = {
    formButtonName: "Register",
    username: null,
    emailMessage: "",
    emailValue: "",
    usernameMessage: "",
    usernameValue: "",
    phoneMessage: "",
    phoneValue: "",
    addressMessage: "",
    addressValue: "",
    sexMessage: "",
    sexValue: "",
    passwordMessage: "",
    passwordValue: ""
  }
  res.render("pages/register", data);
})

app.post('/register', (req, res) => {
  var validData = true;
  let pageData = {
    formButtonName: "Register",
    username: null,
    emailMessage: "",
    emailValue: req.body.email,
    usernameMessage: "",
    usernameValue: req.body.username,
    phoneMessage: "",
    phoneValue: req.body.phone,
    addressMessage: "",
    addressValue: req.body.address,
    sexMessage: "",
    sexValue: req.body.sex,
    passwordMessage: "",
    passwordValue: req.body.password
  };

  if(!validator.isAlphanumeric(req.body.username)) {
    pageData.usernameMessage = "Username must contain only letters and numbers"
    validData = false
  }
  if(!validator.isEmail(req.body.email)) {
    pageData.emailMessage += "Email must be valid"
    validData = false
  }
  if(!validator.isMobilePhone(req.body.phone)) {
    pageData.phoneMessage += "Phone number must be valid"
    validData = false
  }
  if(validator.isEmpty(req.body.address)) {
    pageData.addressMessage += "Address should be entered"
    validData = false
  }
  if(!(req.body.sex == "F" || req.body.sex == "M")) {
    pageData.sexMessage += "Sex must be F or M"
    validData = false
  }
  if(!validator.isStrongPassword(req.body.password)) {
    pageData.passwordMessage += "Password must have at least 8 characters, a lowercase, an uppercase, a number and a symbol"
    validData = false
  }
  
  if(!validData) {
    res.render('pages/register', pageData);
  }
  else {
    insertUser(req.body.username, req.body.email, req.body.phone, req.body.address, req.body.password, req.body.sex,
      (err) => {
        if ( err == null ){
        console.log("TEST")
    
        let user = {
          username : req.body.username,
          email : req.body.email,
          phone : req.body.phone,
          address : req.body.address,
          password : req.body.password,
          sex : req.body.sex
         }
    
         console.log(user)
    
         req.login(user, function (err) {
          if ( ! err ){
              res.redirect('/');
          } else {
            res.redirect('/register');
          }
         })
        }
        else {
          pageData.usernameMessage = "Username taken!"
          res.render('pages/register', pageData);
        }
      });
  }

})


// render the profile of an user
app.get('/profile/:user/', (req,res) => {

  let username = req.params["user"]

  findUser(username, (err: any, row: any) => {
    console.log(row);

    const modelsFolder = 'public/data/' + username;
    const fs = require('fs');
    let models : string[] = [];
    
    if (fs.existsSync(modelsFolder))
      models = fs.readdirSync(modelsFolder);
  
    let pageData = {
      profileData: row,
      models: models
    };
  
    res.render("pages/profile", pageData)
  })
})

app.get('/delete/:user/:filename', (req, res) => {
  let username = req.params["user"]
  let filename = req.params["filename"]

  if ( req.user ){
    if ( (<any>req.user).username == username ){ //if logged in as the target user, then delete the file, else don't
      try {
        fs.unlinkSync("./public/data/" + username + "/" + filename);
      } catch(err) {
        console.error(err)
      }
    }
  }

  // res.render("pages/profile", pageData)
  res.redirect("/profile/" + username);

})

app.get('/show/:user/:filename', (req, res) => {
  let username = req.params["user"]
  let filename = req.params["filename"]
  let pageData = {
    username: username,
    filename: filename
  };

  res.render("pages/viewer", pageData);

})
/*
// returns the specified model of a user
app.get("/model/:user/:modelId", (req, res) => {
  let username = req.params["user"];
  let model = req.params["modelId"];

  let modelPath = 'public/data/' + username + "/" + model;

  console.log(modelPath)

  const fs = require('fs');

  if (fs.existsSync(modelPath)) {
    let fileBinary = fs.readFileSync(modelPath);
    res.send(fileBinary);
  }

  res.status(404).send("");
})
*/

function getUsersWithSubstring(substring : any, cb : any) {
  let searchString = substring;
  console.log(`SELECT username FROM users WHERE username LIKE \'%` + substring + "%\';");
  sqldb.serialize(() => {
		sqldb.all(`SELECT username FROM users WHERE username LIKE \'%` + substring + "%\';", (err: any, rows : any) => {
		  if (err) {
			console.error(err.message);
			}
		  else{
         cb(rows);
		  }
		});
	});
}

app.post("/search", (req, res) => {
  let search = req.body.searchdata;
  res.redirect("/?search=" + search);
})

app.get('/', (req, res) => {

  let userSearch = "";
  if(req.query.search) {
    let t : any = req.query.search;
    userSearch = t;
  }
  getUsersWithSubstring(userSearch, (rows : any) => {

    let t : any = req.user
    let loggedMessage = ""
    let data;

    let usernames = []
    for (let i = 0; i < rows.length; i++) {
      usernames.push(rows[i].username);
    }
  
    if ( req.user ){
      loggedMessage = "You're logged in as " + JSON.stringify(t.username);
      data = {
        username: t.username,
        profiles: usernames
      }
    }
    
    if ( !req.user ){
      loggedMessage = "You are not logged in. Login at localhost/login";
      data = {
        username: null,
        profiles: usernames
      }
    }

    res.render("pages/index", data);
  })
}
);
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});