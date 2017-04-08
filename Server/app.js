var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
//var favicon = require('serve-favicon');
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
// var routes = require('../Server/src/routes/index.js');
var authRouter = require('../Server/src/routes/authRoutes')();
var config = require('./src/config/config.js');


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var MongoClient = require("mongodb").MongoClient;
var mongoUrl = 'mongodb://localhost:27017/homePark';

var mongoDbPromise = MongoClient.connect(mongoUrl)
//authentication setup
require('../Server/src/config/passport')(app);

// view engine setup
app.set('views', './client/views');
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set("layout extractScripts", true);

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
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(function(req,res,next){
  if(req.user) {
    console.log("logged in");
    next();
    return;
  }
  console.log("session not logged in");

  if(req.path === '/' || req.path.toLowerCase().indexOf('/auth/') !== -1){
    console.log("accepted url");
    next();
    return;
  }

  res.redirect("/?m=Please login&info=" + req.url);

});

//app.use(express.static(path.join(__dirname, 'public')));
// app.use('/', routes);
app.use('/Auth', authRouter);


app.use(function(req, res, next){
   // if there's a flash message in the session request, make it available in the response, then delete it
   res.locals.sessionFlash = req.session.sessionFlash;
   delete req.session.sessionFlash;
   next();
});


// Route that creates a flash message using the express-flash module
app.all('/express-flash', function( req, res ) {
   req.flash('success', 'This is a flash message using the express-flash module.');
   res.redirect(301, '/');
});

// Route that creates a flash message using custom middleware
app.all('/session-flash', function( req, res ) {
   req.session.sessionFlash = {
       type: 'success',
       message: 'This is a flash message using custom middleware and express-session.'
   };
   res.redirect(301, '/');
});



// Route that incorporates flash messages from either req.flash(type) or res.locals.flash
app.get('/', function( req, res ) {
  res.render('signIn', { expressFlash: req.flash('success'), sessionFlash: res.locals.sessionFlash,redirectPath: req.query.info });

});



app.get('/error', function( req, res ) {
   res.render('error', { expressFlash: req.flash('success'), sessionFlash: res.locals.sessionFlash });
});

io.on('connection', function(socket){
  socket.on('join', function (data) {
    socket.join(data.email);
  });
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg,email,user,user1){
    console.log('message: ' + msg);
    chatRepo.addMessage(msg,email,Date.now());
    io.to(email).emit('chat message', msg);
  });
});

mongoDbPromise.then(function(db){
  global.db = db;
  var gfs = Grid(db, mongodb);
  global.gfs = gfs;

  console.log(config.port);

  http.listen(config.port, function(){
    console.log('listening on *:3000');
  });
}).catch(function(err){
  console.log("DB Connection failed");
  console.log(err);
});

module.exports = app;
