import express from 'express';

//var PouchDB = require('pouchdb');
//var db = new PouchDB('my_database');

// rest of the code remains same
const app = express();
const PORT = 80;

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/watch', (req,res) => {
  let videoID = req.query["v"]

  let ejs = require('ejs');
  let html = ejs.render('Salutare, vad ca vrei sa te uiti la <b>videoul</b> asta <%= videoID %> , se pare.', {videoID: videoID});

  res.send(html)
  
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