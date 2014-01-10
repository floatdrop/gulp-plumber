'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var watch = require('gulp-watch');
var grep = require('gulp-grep-stream');
var plumber = require('../node_modules/gulp-plumber');
// require('longjohn');

gulp.task('watch', function (cb) {
    gulp.src([ './test/**/*.js', 'index.js' ])
        .pipe(watch({ emit: 'all' }))
        .pipe(grep('**/test/*.js'))
        .pipe(plumber({ errorHandler: false }))
        .pipe(mocha({ reporter: 'spec' }))
        .on('error', function (err) {
            console.log(err.stack);
        })
        .on('end', cb);
});

gulp.task('default', function (cb) {
    gulp.run('watch', cb);
});
