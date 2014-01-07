'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var watch = require('gulp-watch');

// require('longjohn');

gulp.task('watch', function (cb) {
    gulp.src(['test/*.js', 'index.js'], { read: false })
        .pipe(watch(function (events, cb) {
            gulp.src(['test/*.js'])
                .pipe(mocha({ timeout: 5000, reporter: 'spec' }))
                .on('error', function (err) {
                    if (!/tests? failed/.test(err.stack)) {
                        console.log(err.stack);
                    }
                    cb();
                })
                .on('end', cb);
        }))
        .on('end', cb);
});

gulp.task('default', function (cb) {
    gulp.run('watch', cb);
});
