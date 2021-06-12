import express from 'express';
import { linkMiddleware } from './auth';
import { runAutomatedTests } from './autotests';
import { getUsersWithSubstring } from './database';
import { modelsMiddleware } from './models';
import { uploadMiddleware } from './upload';

const app = express();
const PORT = 8080;

linkMiddleware(app);
uploadMiddleware(app);
modelsMiddleware(app);

runAutomatedTests();



app.post("/search", (req, res) => {
  let search = req.body.searchdata;
  res.redirect("/?search=" + search);
});

app.get('/', (req, res) => {
  let userSearch = "";
  if(req.query.search) {
    let t : any = req.query.search;
    userSearch = t;
  }
  getUsersWithSubstring(userSearch, (rows : any) => {
    let t : any = req.user;
    let data;
  
    if (req.user){
      data = {
        username: t.username,
        profiles: rows
      };
    }
    
    if (!req.user){
      data = {
        username: null,
        profiles: rows
      };
    }
    res.render("pages/index", data);
  })
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});