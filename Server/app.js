var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
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

var fs = require('fs');
var path = require('path');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var MongoClient = require("mongodb").MongoClient;
var mongoUrl = 'mongodb://localhost:27017/courtData';

var mongoDbPromise = MongoClient.connect(mongoUrl)
require('node-jsx').install();

var mongoose = require('mongoose');
var State = require('./models/State');
mongoose.connect(mongoUrl);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to db");
});

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

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/graph', function(req, res) {
  res.render('graph');
});

app.get('/graph2', function(req, res) {
  res.render('graph2');
});

app.get('/graph/nodes', function(req, res) {
  let nodesPath = path.join(__dirname, '..', 'watson', 'nodes.json');
  let nodes = JSON.parse(fs.readFileSync(nodesPath)).nodes;
  res.send(JSON.stringify(nodes));
});

app.get('/graph/coords', function(req, res) {
  let coordsPath = path.join(__dirname, '..', 'watson', 'coordinates.json');
  let coords = JSON.parse(fs.readFileSync(coordsPath)).coordinates;
  res.send(JSON.stringify(coords));
});

app.get('/graph/edges', function(req, res) {
  let jsonPath = path.join(__dirname, '..', 'watson', 'edges.json');
  let edges = JSON.parse(fs.readFileSync(jsonPath)).edges;
  res.send(JSON.stringify(edges));
});

// Inserts a new State object in DB
app.post('/state', function(req, res) {
  let stateName = req.body.state.name;

  if (stateName.length !== 2)
    res.send('Was expecting 2 characters for state abbreviation.');

  stateName = stateName.toUpperCase();

  State.findOne({ name: stateName}, function(err, state) {
    if (err) throw err;
    if (state) return res.send('That state already exists in the database.');

    var state = new State({
      name: req.body.state.name,
      keywords: req.body.state.keywords
    });

    // Save state to database
    state.save(function(err) {
      if (err) throw err;
      return res.send('Succesfully inserted state.');
    });
  });
});

// Get a state from db
app.get('/state/:stateName', function(req, res) {
  let stateName = req.params.stateName.toUpperCase();
  State.findOne({ name: stateName }, function(err, state) {
    if (err) throw err;
    if (!state) return res.send('No state found with that name.');
    return res.send(JSON.stringify(state));
  });
});

// Deletes a state from db
app.delete('/state/:stateName', function(req, res) {
  let stateName = req.params.stateName.toUpperCase();
  State.findOneAndRemove({ name: stateName }, function(err, state) {
    if (err) throw err;
    if (!state)
      return res.send('No state found with those initials');
    res.send('State deleted.');
  });
});



// var testState = new State({ name: 'California', keywords: [{ keyword: 'Hello', score: 111 }]});
//
// testState.save(function(err) {
//     if (err) throw err;
//     // return
//     // res.send('Succesfully inserted state!!.');
// });

// State.find(function (err, states) {
//   if (err) return console.error(err);
//   for (let obj of states) {
//     console.log(obj);
//   }
// })



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
