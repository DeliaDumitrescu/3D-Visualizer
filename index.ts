import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import passport from "passport";
import strategy from "passport-facebook";

//var PouchDB = require('pouchdb');
//var db = new PouchDB('my_database');

// rest of the code remains same
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'))

const FacebookStrategy = strategy.Strategy;
app.use(passport.initialize());

passport.serializeUser(function (user, done) {s
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj as any);
});

passport.use(new FacebookStrategy({
  clientID: "926992954758657",
  clientSecret: "02c48ae3f2827680148546f183e06607",
  callbackURL: "http://localhost:8080/auth/facebook/callback"
}, function (accessToken, refreshToken, profile, done) {
  console.log('AAA')
  return done(null, profile);
}
));

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));


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

app.get('/login', (req,res) => {
  res.send("Aici ar trebui sa te loghezi.")
})

app.post('/logout', (req,res) => {
  // ...
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
  let html = ejs.render('<%= people.join(", "); %> </br> For more, click <a href="viewer.html">here</a>.', {people: people});

  res.send(html)
}
);
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});