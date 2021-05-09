import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import passport from "passport";
import strategy from "passport-facebook";
import session from "cookie-session"
import dotenv from "dotenv";

dotenv.config();

// rest of the code remains same
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'))

const FacebookStrategy = strategy.Strategy;
const cookieSession = session;

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
var db = new PouchDB('users');

app.use(cookieSession({
  name: 'facebook-auth-session',
  secret: 'secret'
}))
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj as any);
});

const clientID = process.env.FACEBOOK_CLIENT_ID
const clientSecret = process.env.FACEBOOK_CLIENT_SECRET
const callbackURL = process.env.FACEBOOK_CALLBACK_URL
if(!clientID || !clientSecret || !callbackURL) {
  throw new Error('Env not set up');
}

passport.use(new FacebookStrategy({
  clientID: clientID,
  clientSecret: clientSecret,
  callbackURL: callbackURL
}, function (accessToken, refreshToken, profile, done) {
  //console.log(profile)
  db.putIfNotExists(profile.id, {displayName: profile.displayName}).then(function (res: any) {
    console.log(res)
  }).catch(function (err: any) {
    console.log(":(")
  });
  return done(null, profile);
}
));

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

app.get('/test', (req, res) => {
  console.log(req.user);
  res.send(req.user);
})

app.get('/logout', (req,res) => {
  req.session = null;
  req.logout();
  console.log(req.user);
  res.redirect('/');
})

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
  let people = ['antonio', 'delia', 'liviu', 'silviu'];
  let html = ejs.render('<%= people.join(", "); %> </br> For more, click <a href="viewer.html">HERE</a>. <br> For LOGIN WITH FACEBOOK, click <a href="/auth/facebook"> HERE </a>.  <br> For LOGOUT, click <a href="/logout"> HERE </a>. <br> To test if logged in, click <a href="/test"> HERE </a>.' , {people: people});

  res.send(html)
}
);
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});