import express from 'express';
// rest of the code remains same
const app = express();
const PORT = 80;

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

app.get('/wall/:user/', (req,res) => {
  res.send("Esti pe wallul lui " + req.params["user"])
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