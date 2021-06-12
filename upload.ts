import formidable from "formidable";
import fs from 'fs';

export function uploadMiddleware(app: any) {
    app.get('/upload', (req: any, res: any) => {
        let data = {
          formButtonName: "Upload",
          username: req.user
        };
        res.render("pages/upload", data);
      });

    app.post('/fileupload', (req: any, res: any) => {
        if(!req.user) {
            res.send("You are not logged in.");
            return;
        }
        var form = new formidable.IncomingForm();
        // When formidable parses files, they are stored in a temp folder.
        // So they have to be moved from the oldPath to the newPath
        // with fs.rename
        form.parse(req, function (err, fields, files) {
            let oldpath = ((files.filetoupload as unknown) as formidable.File ).path;
            // Uploaded filename. Weird casting neccessary because formidable type definitions are wrong.
            let filename = ((files.filetoupload as unknown) as formidable.File ).name;
            let username = (<any>req.user).username;
            moveFileFromTempDir(oldpath, <string>filename, username, res, ()=>{});
        });
    });
}

export function moveFileFromTempDir(oldpath :string, filename :string, username:string, res: any, cb:any){
    let userDir = './public/data/' + username;
    if (!fs.existsSync(userDir)){
        fs.mkdirSync(userDir);
    }

    var newpath = userDir + "/" + filename;
    console.log("File uploaded in " + newpath);

    fs.rename(oldpath, newpath, function (errr: any) {
        if (errr) throw errr;
        if (res){
            res.redirect("/profile/" + username);
        }
        cb();
    });
}