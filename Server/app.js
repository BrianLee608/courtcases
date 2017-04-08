var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var React = require('react/addons')
var Router = require('react-router').Router
var Route = require('react-router').Route
var Link = require('react-router').Link
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var bodyParser = require('body-parser');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var port = process.env.PORT || 5000;
var repos = require('./src/dal/repos');

var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
var Grid = require('gridfs-stream');
var multer = require("multer");


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var MongoClient = require("mongodb").MongoClient;
var mongoUrl = 'mongodb://localhost:27017/courtData';

var mongoDbPromise = MongoClient.connect(mongoUrl)
require('node-jsx').install();

// view engine setup
app.set('views', './client/views');
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({}));
app.use(cookieParser());
app.use(express.static('public'));

var sess = { store: new MongoStore({ dbPromise: mongoDbPromise }), secret: 'homepark+exequt=awesomesss',  cookie: {maxAge: 600000}};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess));

app.get('/', function( req, res ) {
  var ReactApp = React.createFactory(require('../Client/Components/app'));
  var reactHtml = React.renderToString(ReactApp({}));
  res.render('signIn', {html: reactHtml});
});


mongoDbPromise.then(function(db){
  global.db = db;
  var gfs = Grid(db, mongodb);
  global.gfs = gfs;

  console.log(3000);

  http.listen(3000, function(){
    console.log('listening on *:3000');
  });
}).catch(function(err){
  console.log("DB Connection failed");
  console.log(err);
});

module.exports = app;
