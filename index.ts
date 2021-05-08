import express from 'express';
import formidable from 'formidable';
import fs from 'fs';

//var PouchDB = require('pouchdb');
//var db = new PouchDB('my_database');

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