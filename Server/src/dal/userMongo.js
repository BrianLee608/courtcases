var bcrypt = require('bcrypt');
var braintree = require("braintree");
var repos = require('../dal/repos');
var usersRepo = repos.usersRepo;
var ObjectId = require('mongodb').ObjectId;
var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "6jfzh9m8d7ccqkz8",
    publicKey: "x8y2f9bfn2gn3zmx",
    privateKey: "6e401b98a9c420342858c5d7c466da27"
});
var authUtil = require('../utils/auth');
var config = require('../config/config')
var services = {
    registerUser(user, callbacks){
      var obj = {};
       var collection = db.collection('providerApplications');
       collection.findOne({
           email: user.username,
           status: "accepted"
       }, function (err, results) {
         console.log("Searching for matching provider applications for: " + user.username);
         console.log(results);
         var collection = db.collection('users');
         collection.findOne({
             username: user.username
         }, function(err, results) {
             if (results === null) {

               var collection = db.collection('users');

               collection.insert(user, function(err, results) {
                 callbacks.success(user);
               });

             } else {
               callbacks.error('User is already in the database please use another email.')
             }
         });
       });
    },
    getUser(userId, callbacks) {
        db.collection('users').findOne({
            _id: userId
        }, function(err, user) {
            if (err) {
                callbacks.error(e);
            }
            callbacks.success(user);
        });
    },
    getUserByUsername(userName, callbacks) {
        db.collection('users').findOne({
            username: userName
        }, function(err, user) {
            if (err || !user) {
                callbacks.error("User not found");
            }
            callbacks.success(user);
        });
    },
};
module.exports = services;
