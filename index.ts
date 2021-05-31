import express from 'express';
import formidable from 'formidable';
import fs from 'fs';

//var PouchDB = require('pouchdb');
//var db = new PouchDB('my_database');

// rest of the code remains same
const app = express();
const PORT = 80;










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

function findUser(username : any, cb :any){
  cb(null, {username: "antonio", password:"antonio"})
  // TODO : implement this with files / database
}

passport.use(new Strategy(
  function(username : any, password : any, cb : any) {
    findUser(username, function(err : any, user : any) {
      if (err) { return cb(err); }
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
  res.render("pages/login", {})
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// END OF PASSPORT JS








app.get('/watch', (req,res) => {
  let videoID = req.query["v"]

  let ejs = require('ejs');
  let html = ejs.render('Salutare, vad ca vrei sa te uiti la <b>videoul</b> asta <%= videoID %> , se pare.', {videoID: videoID});

  res.send(html)
  
})

// This simply returns a fileupload html form on GET /upload
app.get('/upload', (req,res) => {
  // TODO: move this into an ejs partial.
  res.send('<form action="fileupload" method="post" enctype="multipart/form-data"><input type="file" name="filetoupload"><br><input type="submit"></form>');
})

app.post('/fileupload', (req,res) => {
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
    var newpath = './public/data/' + filename;

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

app.get('/register', (req,res) => {
  res.send("Aici ar trebui sa te inregistrezi.")
})

// render the profile of an user
app.get('/profile/:user/', (req,res) => {

  let username = req.params["user"]

  const modelsFolder = 'public/data/' + username;
  const fs = require('fs');
  let models : string[] = [];
  
  if (fs.existsSync(modelsFolder))
    models = fs.readdirSync(modelsFolder);

  let pageData = {
    username: username,
    models: models
  };

  res.render("pages/profile", pageData)
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

app.get('/', (req, res) =>{

  let ejs = require('ejs');

  let t : any = req.user
  let loggedMessage = ""

  if ( req.user ){
    loggedMessage = "You're logged in as " + JSON.stringify(t.username);
  }
  
  if ( !req.user ){
    loggedMessage = "You are not logged in. Login at localhost/login";
  }

  let html = ejs.render('<%= loggedMessage %> </br> For more, click <a href="viewer.html">here</a>.<br> <a href="login">Login</a> <br> <a href="/logout">Logout</a>', {loggedMessage: loggedMessage});

  res.send(html)
}
);
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});