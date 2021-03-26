import express from 'express';
// rest of the code remains same
const app = express();
const PORT = 80;
app.use(express.static('public'))
app.get('/', (req, res) =>{
  
  let ejs = require('ejs');
  let people = ['geddy', 'neil', 'alex'];
  let html = ejs.render('<%= people.join(", "); %>', {people: people});

  res.send(html)
}
);
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});