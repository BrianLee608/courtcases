var express = require('express');
var authRouter = express.Router();
var passport = require('passport');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var flash = require('express-flash');
var repos = require('../dal/repos');
var authRepo = repos.authRepo;
var usersRepo = repos.usersRepo;
var multer = require("multer");
var repos = require('../dal/repos');
var providersRepo = repos.providersRepo;
var authUtil = require("../utils/auth");

//global variables used: gfs, db
var fs = require('fs');

var sendEmail = function(email, text, pass, message1, message2, req, res) {
    authRepo.sendEmail(email, pass, {
        success: function(results) {
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'malik.hijazi@gmail.com',
                    pass: 'Drogb@!3'
                }
            });
            var mailOptions = {
                from: '"FIT WORLD 👥" <malik.hijazi@gmail.com>', // sender address
                to: email, // list of receivers
                subject: 'Hello ✔', // Subject line
                text: text, // plaintext body
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    return console.log(error);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });
            req.flash('success', message1);
            if (req.body.mobile) {
                res.json({
                    status: "success",
                    message: message1
                });
            } else {
                console.log(email);
                res.redirect('/auth/login?m=We have sent you an email. Please verify your account to proceed.')
            }
        },
        error: function() {
            req.flash('success', message2);
            if (req.body.mobile) {
                res.json({
                    status: "failure",
                    message: message2
                });
            } else {
                res.redirect('/auth/login');
            }
        }
    });
};

var sendEmailToRob = function(req, res) {
    var appUrl = req.protocol + '://' + req.get('Host')
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'malik.hijazi@gmail.com',
            pass: 'Drogb@!3'
        }
    });
    var mailOptions = {
        from: '"FIT WORLD 👥" <malik.hijazi@gmail.com>', // sender address
        to: "monzerhijazi@gmail.com", // list of receivers
        subject: "New Provider Request", // Subject line
        text: "Fit World Team, A new user has reqeusted to become a Fit World Provider. Please review the user's credentials and and either accept/deny the request. " + appUrl + "/providers/adminPage" // plaintext body
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
    req.flash('success');
};

var router = function() {

    authRouter.route('/signUp')
        .get(function(req, res, next) {
            res.render("signUp");
        })
        .post(function(req, res) {
            console.log("in post req signUp");
            var baseUrl = req.protocol + '://' + req.get('Host');
            var username = req.body.email;
            console.log("username is " + username);
            var pass = authUtil.createHash(req.body.password);
            var randomText = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 5; i++) {
                randomText += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            var token = authUtil.createHash(randomText);
            var string = encodeURIComponent(username + '/' + token);
            var text = 'You have requested to create an account at Homepark.com. To verify this please click the link: ' + baseUrl + '/auth/verify/?info=' + string;
            var message1 = 'An email has been sent to ' + username + '. Please verify your email.';
            var message2 = 'User is already in the database please use another email.';
            var user = {
                name: req.body.name,
                username: username,
                password: pass,
                verificationToken: token,
                verified: false
            };
            console.log(user);
            console.log("calling auth repo");
            usersRepo.registerUser(user, {
              success: function(user){
                console.log(user);
                console.log(username);
                req.user = user;
                sendEmail(user.username, text, pass, message1, message2, req, res);

              },
              error: function(err){
                console.log("had error");
                console.log(err);
                req.flash('success', err);
                res.redirect('/auth/login?m=' + err);
              }
            });


        });
    authRouter.route('/signIn')
        .post(function(req, res, next) {
            passport.authenticate('local', function(err, user, info) {
                if (err || !user) {
                    console.log(err);
                    if (req.body.mobile) {
                        return res.json({
                            status: "failure",
                            user: null,
                            err
                        });
                    } else {
                        return res.redirect('/?m=Username or password is incorrect&info=' + req.body.redirectPath);
                    }
                }
                console.log("LOGGED IN");
                console.log(user);
                req.logIn(user, function(err) {
                    if (err) {
                      console.log("error");
                      res.redirect('/?m=Username or password is incorrect&info=' + req.body.redirectPath);
                        //return next(err);
                    }
                    if (req.body.mobile) {
                        console.log("mobile");
                        return res.json({
                            status: "success",
                            user: user
                        });
                    } else {
                      console.log("web");
                      //var redirectPath = req.body.redirectPath || "/";
                      res.redirect('/auth/profile');
                    }
                });
            })(req, res, next);
        });
    authRouter.route('/profile')

    .all(function(req, res, next) {
            if (!req.user) {
                req.flash('success', 'Please sign in first.');
                res.redirect('/auth/login?info=/');
            } else {
                next();
            }
        })
        .get(function(req, res) {
            res.json(Object.assign({}, req.user, { password: "", verificationToken: "" }));
        });
    authRouter.route('/logout')
        .get(function(req, res) {
            if (!req.user) {
                res.redirect('/');
            } else {
                req.logOut();
                req.flash('success', 'You have successfully logged out.');
                res.redirect('/auth/login');
            }
        })
        .post(function(req, res, next) {
          if (!req.user) {
            res.json({
                status: "success",
                message: "User is not logged in."
            });
          } else {
              req.logOut();
              res.json({
                  status: "success"
              });
          }
        });
    authRouter.route('/login')
        .all(function(req, res, next) {
            if (req.user) {
                console.log("worked");
                res.redirect('/');
            } else {
                console.log("didn't work");
                console.log(req.query.m);
                res.render('signIn', {
                    expressFlash: req.flash('success'),
                    sessionFlash: res.locals.sessionFlash,
                    redirectPath: req.query.info,
                    message: req.query.m
                });
            }
        });
    authRouter.route('/forgot')
        .get(function(req, res, next) {
            res.render('forgot');
        });

    authRouter.route('/reset')
        .post(function(req, res, next) {
            var appUrl = req.protocol + '://' + req.get('Host')
            authRepo.findUser(req.body.userName, {
                success: function(results) {
                    if (results == null) {
                        req.flash('success', 'There is no account corresponding to this email. Please sign up.');
                        res.redirect('/auth/login');
                    } else {
                        var string = encodeURIComponent(req.body.userName + '/' + results.password);
                        var text = 'You have requested to create an account at Homepark.com. To verify this please click the link: ' + appUrl + '/auth/resetPass/?info=' + string;
                        var message1 = 'An email has been sent to ' + req.body.userName + '. Please verify your email.';
                        var message2 = 'A user with this email has not made an account yet.';
                        sendEmail(req.body.userName, text, '', message1, message2, req, res);
                    }
                },
                error: function(e) {
                    console.log(e);
                }
            });
        });
    authRouter.route('/resetPass')
        .get(function(req, res, next) {
            var string = decodeURIComponent(req.query.info);
            var slashIndex = string.indexOf('/');
            var username = string.substring(0, slashIndex);
            var pass = string.substring(slashIndex + 1, string.length);
            authRepo.resetPass(username, pass, {
                success: function() {
                    var user = {
                        username: username,
                        password: pass
                    };
                    req.login(user, function() {
                        res.redirect('/');
                    });
                },
                error: function(e) {
                    console.log(e);
                }
            });
        });
    authRouter.route('/verify')
        .get(function(req, res) {
            var string = decodeURIComponent(req.query.info);
            var slashIndex = string.indexOf('/');
            var username = string.substring(0, slashIndex);
            var token = string.substring(slashIndex + 1, string.length);
            authRepo.verify(username, token, {
                success: function(user) {
                  req.login(user, function() {
                    res.redirect('/');
                  });
                },
                error: function() {
                    res.redirect('/');
                }
            });
        });
    authRouter.route('/google/callback')
        .get(function(req, res, next) {
            passport.authenticate('google', function(err, user, info) {
                if (err || !user) {
                    req.flash('success', 'Username or password is incorrect');
                    return res.redirect('/auth/login');
                }
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect('/auth/profile');
                });
            })(req, res, next);
        });
    authRouter.route('/google')
        .get(passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ]
        }));
    authRouter.route('/facebook/callback')
        .get(function(req, res, next) {
            passport.authenticate('facebook', function(err, user, info) {
                if (err || !user) {
                    req.flash('success', 'Username or password is incorrect');
                    return res.redirect('/auth/login');
                }
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect('/auth/profile');
                });
            })(req, res, next);
        });
    authRouter.route('/facebook')
        .get(passport.authenticate('facebook', {
            scope: ['email']
        }));
    authRouter.route('/facebook-mobile')
        .post(function(req, res, next) {
          authRepo.findUser(req.body.userName, {
              success: function(results) {
                  if (results == null) {
                        var collection = db.collection('users');
                        var user = {
                            name: req.body.name,
                            username: req.body.userName,
                            password: null,
                            verified: false
                        };
                        collection.insert(user, function(err, results) {
                          req.login(user, function(err) {
                              if (err) {
                                return res.json({
                                    status: "failure",
                                    message: "Error in adding to database."
                                });
                              } else {
                                return res.json({
                                    status: "success",
                                    user: user
                                });
                              }
                          });
                        });

                  } else {
                    req.login(results, function(err) {
                        if (err) {
                          console.log(err);
                          return res.json({
                              status: "failure",
                              message: "Error in adding to database."
                          });
                        } else {
                          console.log("success");
                          return res.json({
                              status: "success",
                              user: results
                          });
                        }
                    });
                  }
              },
              error: function(e) {
                  console.log(e);
              }
          });
        });
        var saveProviderApplication = function(req, res, providerApplication){
          providersRepo.submitProviderApplication(providerApplication, {
              success: function() {
                  if (req.body.mobile) {
                      res.json({
                          status: "success"
                      });
                  } else {
                      console.log(providerApplication);
                      console.log("redirecting from server side");
                      res.redirect("/?m=Your application has been submitted");
                  }
                  sendEmailToRob(req, res);
              },
              error: function(e) {
                console.log("error happened");
                console.log(e);
                if (req.body.mobile) {
                    res.json({
                        status: "failure"
                    });
                } else {
                    req.flash('success', 'Error, please try again.');
                    res.redirect('/providers/provider');
                }
              }
          });
        }

        authRouter.route('/becomeProvider')
          .get(function(req, res, next){
              res.render('becomeProvider');
          });
    return authRouter;
};

module.exports = router;
