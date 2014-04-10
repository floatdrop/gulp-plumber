/*global describe, it, before */
'use strict';

var should = require('should'),
    es = require('event-stream'),
    gutil = require('gulp-util'),
    gulp = require('gulp');

delete require.cache[require.resolve('..')];
var plumber = require('../');
var fixturesGlob = ['./test/fixtures/*'];

describe('stream', function () {

    it('piping into second plumber should keep piping', function (done) {
        gulp.src(fixturesGlob)
            .pipe(plumber())
            .pipe(gutil.noop())
            .pipe(plumber())
            .pipe(es.writeArray(function (err, array) {
                array.should.eql(this.expected);
                done();
            }.bind(this)))
            .on('end', function () {
                done();
            });
    });

    it('should work with es.readarray', function (done) {
        var expected = ['1\n', '2\n', '3\n', '4\n', '5\n'];

        es.readArray([1, 2, 3, 4, 5])
            .pipe(plumber())
            .pipe(es.stringify())
            .pipe(es.writeArray(function (error, array) {
                array.should.eql(expected);
                done();
            }));
    });

    it('should emit `end` after source emit `finish`', function (done) {
        gulp.src(fixturesGlob)
            .pipe(plumber())
            // Fetchout data
            .on('data', function () { })
            .on('end', done)
            .on('error', done);
    });

    describe('should passThrough all incoming files', function () {
        it('in non-flowing mode', function (done) {
            gulp.src(fixturesGlob)
                .pipe(plumber({ errorHandler: done }))
                .pipe(es.writeArray(function (err, array) {
                    array.should.eql(this.expected);
                    done();
                }.bind(this)))
                .on('error', done);
        });

        // it('in flowing mode', function (done) {
        //     gulp.src(fixturesGlob)
        //         .pipe(plumber({ errorHandler: done }))
        // // You cant do on('data') and pipe simultaniously.
        //         .on('data', function (file) { should.exist(file); })
        //         .pipe(es.writeArray(function (err, array) {
        //             array.should.eql(this.expected);
        //             done();
        //         }.bind(this)))
        //         .on('error', done);
        // });
    });

    before(function (done) {
        gulp.src(fixturesGlob)
            .pipe(es.writeArray(function (err, array) {
                this.expected = array;
                done();
            }.bind(this)));
    });

});
