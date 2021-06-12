import { findUser } from "./database";
import fs from 'fs';

export function modelsMiddleware(app: any) {
    // render the profile of an user
    app.get('/profile/:user/', (req: any, res: any) => {
        let username = req.params["user"]
        let loggedUser : any = null;
    
        if (req.user){
        loggedUser = (<any>req.user).username;
        }
    
        findUser(username, (err: any, row: any) => {
        const modelsFolder = 'public/data/' + username;
        const fs = require('fs');
        let models : string[] = [];
        
        if (fs.existsSync(modelsFolder))
            models = fs.readdirSync(modelsFolder);
        
        let pageData = {
            profileData: row,
            models: models,
            loggedUser : loggedUser
        };
    
        res.render("pages/profile", pageData)
        })
    })
    
    app.get('/delete/:user/:filename', (req: any, res: any) => {
        let username = req.params["user"]
        let filename = req.params["filename"]
    
        if (req.user){
        if ( (<any>req.user).username == username ){ //if logged in as the target user, then delete the file, else don't
            try {
            fs.unlinkSync("./public/data/" + username + "/" + filename);
            } catch(err) {
            console.error(err)
            }
        }
        }
    
        res.redirect("/profile/" + username);
    
    })
    
    app.get('/show/:user/:filename', (req: any, res: any) => {
        let username = req.params["user"]
        let filename = req.params["filename"]
        let pageData = {
        username: username,
        filename: filename
        };
    
        res.render("pages/viewer", pageData);
    
    })
}