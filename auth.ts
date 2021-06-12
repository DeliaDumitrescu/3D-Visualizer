import express from 'express';
import { Strategy } from 'passport-local';
import { findUser, insertUser } from './database';
var session = require('express-session');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var validator = require('validator');

export function linkMiddleware(app: any) {
    app.use(cookieParser('secret'));
    app.use(cookieSession({signed:false}));
    app.use(session({ secret: 'anything' }));
    app.use(require('body-parser').urlencoded({ extended: true }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.set('view engine', 'ejs');
    app.use(express.static('public'));

    passport.use(new Strategy(
        function(username : any, password : any, cb : any) {
            findUser(username, function(err : any, user : any) {
            if (err) { return cb(null); }
            if (!user) { return cb(null, false); }
            if (user.password != password) { return cb(null, false); }
                return cb(null, user);
            });
        }
    ));
      
    passport.serializeUser(function(user :any, done :any) {
        done(null, JSON.stringify(user));
    });
    
    passport.deserializeUser(function(user :any, done :any) {
        done(null, JSON.parse(user));
    });

    loginMiddleware(app);
    registerMiddleware(app);
    logoutMiddleware(app);
}

function loginMiddleware(app: any) {
    app.post('/login',
        passport.authenticate('local', { successRedirect: '/',
            failureRedirect: '/login'})
    );

    app.get('/login', (req: any, res: any) => {
        let data = {
            formButtonName: "Login",
            username: null,
            emailMessage: "",
            emailValue: "",
            usernameMessage: "",
            usernameValue: "",
            phoneMessage: "",
            phoneValue: "",
            addressMessage: "",
            addressValue: "",
            sexMessage: "",
            sexValue: "",
            passwordMessage: "",
            passwordValue: ""
        };
        res.render("pages/login", data);
    });
}

function registerMiddleware(app: any) {
    app.get('/register', (req: any, res: any) => {
        let data = {
            formButtonName: "Register",
            username: null,
            emailMessage: "",
            emailValue: "",
            usernameMessage: "",
            usernameValue: "",
            phoneMessage: "",
            phoneValue: "",
            addressMessage: "",
            addressValue: "",
            sexMessage: "",
            sexValue: "",
            passwordMessage: "",
            passwordValue: ""
        };
        res.render("pages/register", data);
    });
        
    app.post('/register', (req: any, res: any) => {
        var validData = true;
        let pageData = {
            formButtonName: "Register",
            username: null,
            emailMessage: "",
            emailValue: req.body.email,
            usernameMessage: "",
            usernameValue: req.body.username,
            phoneMessage: "",
            phoneValue: req.body.phone,
            addressMessage: "",
            addressValue: req.body.address,
            sexMessage: "",
            sexValue: req.body.sex,
            passwordMessage: "",
            passwordValue: req.body.password
        };
        
        if(!validator.isAlphanumeric(req.body.username)) {
            pageData.usernameMessage = "Username must contain only letters and numbers";
            validData = false;
        }
        if(!validator.isEmail(req.body.email)) {
            pageData.emailMessage += "Email must be valid";
            validData = false;
        }
        if(!validator.isMobilePhone(req.body.phone)) {
            pageData.phoneMessage += "Phone number must be valid";
            validData = false;
        }
        if(validator.isEmpty(req.body.address)) {
            pageData.addressMessage += "Address should be entered";
            validData = false;
        }
        if(!(req.body.sex == "F" || req.body.sex == "M")) {
            pageData.sexMessage += "Sex must be F or M";
            validData = false;
        }
        if(!validator.isStrongPassword(req.body.password)) {
            pageData.passwordMessage += "Password must have at least 8 characters, a lowercase, an uppercase, a number and a symbol";
            validData = false;
        }
        
        if(!validData) {
            res.render('pages/register', pageData);
        }
        else {
            insertUser(req.body.username, req.body.email, req.body.phone, req.body.address, req.body.password, req.body.sex,
            (err) => {
                if ( err == null ){
                    let user = {
                        username : req.body.username,
                        email : req.body.email,
                        phone : req.body.phone,
                        address : req.body.address,
                        password : req.body.password,
                        sex : req.body.sex
                    };
                        
                    req.login(user, function (err: any) {
                        if (!err) {
                            res.redirect('/');
                        } else {
                            res.redirect('/register');
                        }
                    });
                }
                else {
                    pageData.usernameMessage = "Username taken!";
                    res.render('pages/register', pageData);
                }
            });
        }
    })
}

function logoutMiddleware(app: any) {
    app.get('/logout', function(req: any, res: any){
        req.logout();
        res.redirect('/');
    });
}
