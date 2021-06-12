/* Code standards
-> camelCase variables and functions
-> upperCase for global variables
-> spaces around operators
-> indentation
-> end a simple statement with a semicolon
-> line length < 80
*/

import express from 'express';
import { linkMiddleware } from './auth';
import { getUsersWithSubstring } from './database';
import { modelsMiddleware } from './models';
import { uploadMiddleware } from './upload';

const app = express();
const PORT = 8080;

linkMiddleware(app);
uploadMiddleware(app);
modelsMiddleware(app);

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
    let data;
    let usernames = []
    for (let i = 0; i < rows.length; i++) {
      usernames.push(rows[i].username);
    }
  
    if (req.user){
      data = {
        username: t.username,
        profiles: usernames
      }
    }
    
    if (!req.user){
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