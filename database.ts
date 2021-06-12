import fs from 'fs';

const SQLITE3 = require('sqlite3').verbose();
var DIR = './database';

if (!fs.existsSync(DIR)){
    fs.mkdirSync(DIR);
}

let sqldb = new SQLITE3.Database('./database/users.db', SQLITE3.OPEN_READWRITE | SQLITE3.OPEN_CREATE, (err: any) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');

  sqldb.serialize(() => {

    sqldb.run(`CREATE TABLE IF NOT EXISTS "users" (
      "username"	TEXT NOT NULL UNIQUE,
      "email"     TEXT NOT NULL,
      "phone"     TEXT NOT NULL,
      "address"   TEXT NOT NULL,
      "password"	TEXT NOT NULL,
      "sex" TEXT NOT NULL
    );`)
  
    console.log("sqlite db init'd")
  });
});

export function insertUser(username: string, email: string, phone: string, address: string, password: string, sex: string, cb : (err : Error | null) => any){
  sqldb.serialize(() => {
		sqldb.run(`INSERT INTO "main"."users"("username", "email", "phone", "address","password", "sex") VALUES (?,?,?,?,?,?);`, username, email, phone, address, password, sex, function (err : any){
			if (err) {
				console.log (err)
        cb(err)
			} else{
        cb(null)
      }
		})
	});
}

export function findUser(username: any, cb: any){
  sqldb.serialize(() => {
		sqldb.all(`SELECT * FROM users WHERE username=? LIMIT 1;`, username, (err: any, rows : any) => {
		  if (err) {
        console.error(err.message);
        cb("error sqlite", "error sqlite")
		  }
		  else {
        if (rows.length == 1) {
          cb(null, rows[0]);
        }
        else {
          cb("error : not registered", "not registered");
        }
		  }
		});
	});
}

export function getUsersWithSubstring(substring : any, cb : any) {
    sqldb.serialize(() => {
          sqldb.all(`SELECT username FROM users WHERE username LIKE \'%` + substring + "%\';", (err: any, rows : any) => {
            if (err) {
              console.error(err.message);
              }
            else{
           cb(rows);
            }
          });
      });
  }
  