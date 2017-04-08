
var bcrypt = require('bcrypt');
var services = {
  verify(username, token, callbacks) {
    var collection = db.collection('users');
    try {
        collection.updateOne({
              'username': username,
              'verificationToken': token
          }, {
              $set: {
                  'verified': true
              }
        });
        collection.findOne({
            username: username
        }, function(err, results) {
            if (err) {callbacks.error(e);}
            console.log(results);
            callbacks.success(results);

        });
    } catch (e) {
        callbacks.error(e);
    }
  },
  resetPass(username, password, callbacks) {
    var collection = db.collection('users');
    try {
        collection.updateOne({
            'username': username
        }, {
            $set: {
                'password': password
            }
        });
        callbacks.success();
    } catch (e) {
        callbacks.error(e);
    }
  },
  sendEmail(email, pass, callbacks) {
    var collection = db.collection('users');
    collection.findOne({
        username: email
    }, function(err, results) {
        if (results === null || pass === '' || !results.verified) {
            callbacks.success();
        } else {
            callbacks.error();
        }
    });
  },
  findUser(username, callbacks) {
    var collection = db.collection('users');
    try {
      var results = collection.findOne({
          'username': username
      }).then(function(results) {
          callbacks.success(results);
      });
    } catch (e) {
        callbacks.error(e);
    }
  }
};

module.exports = services;
