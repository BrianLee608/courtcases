/*jslint node: true */
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jsFiles = ['*.js', 'Server/src/**/*.js'];
var cssFile = ['*.css'];

var uiFiles = jsFiles.concat(cssFile);
var serve = function(){
  var options = {
      script: './Server/app.js',
      delayTime: 1,
      env: {
          'PORT': 3000
      },
      watch: uiFiles
  };
  return nodemon(options).on('restart', function() {
      console.log('Restarting...');
  });
};

gulp.task('default', serve);
