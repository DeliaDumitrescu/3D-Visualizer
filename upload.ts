import formidable from "formidable";
import fs from 'fs';

export function uploadMiddleware(app: any) {
    app.get('/upload', (req: any, res: any) => {
        let data = {
          formButtonName: "Upload",
          username: req.user
        }
        res.render("pages/upload", data);
      })

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
            var oldpath = ((files.filetoupload as unknown) as formidable.File ).path;
        
            // Uploaded filename. Weird casting neccessary because formidable type definitions are wrong.
            var filename = ((files.filetoupload as unknown) as formidable.File ).name;
            let t : any = req.user
            let userDir = './public/data/' + t.username;
            if (!fs.existsSync(userDir)){
                fs.mkdirSync(userDir);
            }
        
            var newpath = userDir + "/" + filename;
            console.log("File uploaded in " + newpath)
        
            fs.rename(oldpath, newpath, function (errr: any) {
                if (errr) throw errr;
                res.redirect("/profile/" + t.username);
            });
        });
    })
}
