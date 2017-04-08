var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var config = require("../config")
var FacebookStrategy = require('passport-facebook').Strategy;
module.exports = function() {
  passport.use(new FacebookStrategy({
    clientID: '973949779417962',
    clientSecret: '93d8eaf83023e14d118eb68a30325471',
    callbackURL: "/auth/facebook/callback",
    passReqToCallback: true,
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(req, accessToken, refreshToken, profile, done) {
    var collection = db.collection('users');
    collection.findOne({
        username: profile.emails[0].value
    }, function(err, results) {
        if (results === null) {
          var user = {
              username: profile.emails[0].value,
              password: null,
              verified: true
          };
          collection.insert(user, function(err, results) {
              done(null, user);
          });
        } else {
            var user = results;
            done(null, user);
        }
    });
  }));
};
