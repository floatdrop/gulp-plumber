/*global describe, it, before, beforeEach */
'use strict';

var should = require('should'),
    es = require('event-stream'),
    gutil = require('gulp-util'),
    gulp = require('gulp');

delete require.cache[require.resolve('..')];

var plumber = require('../');

var errorMessage = 'Bang!';
var fixturesGlob = ['./test/fixtures/index.js', './test/fixtures/test.js'];
var delay = 20;

describe('errorHandler', function () {
    it('should attach custom error handler', function (done) {
        gulp.src(fixturesGlob)
            .pipe(plumber({ errorHandler: function (error) {
                error.toString().should.include(errorMessage);
                done();
            }}))
            .pipe(this.failingQueueStream);
    });

    it('should attach default error handler', function (done) {
        var mario = plumber();
        mario.errorHandler = function (error) {
            error.toString().should.include(errorMessage);
            done();
        };
        gulp.src(fixturesGlob)
            .pipe(mario)
            .pipe(this.failingQueueStream);
    });

    describe('should attach error handler', function () {
        it('in non-flowing mode', function (done) {
            var delayed = gutil.noop();
            setTimeout(delayed.write.bind(delayed, 'data'), delay);
            setTimeout(delayed.write.bind(delayed, 'data'), delay);
            delayed
                .pipe(plumber({ errorHandler: done.bind(null, null) }))
                .pipe(this.failingQueueStream);
        });

        it('in flowing mode', function (done) {
            var delayed = gutil.noop();
            setTimeout(delayed.write.bind(delayed, 'data'), delay);
            setTimeout(delayed.write.bind(delayed, 'data'), delay);
            delayed
                .pipe(plumber({ errorHandler: done.bind(null, null) }))
                .on('data', function (data) { })
                .pipe(this.failingQueueStream);
        });
    });

    describe('should not attach error handler', function () {
        it('in non-flowing mode', function (done) {
            (function () {
                gulp.src(fixturesGlob)
                    .pipe(plumber({ errorHandler: false }))
                    .pipe(this.failingQueueStream)
                    .on('end', done);
            }).should.throw();
            done();
        });

        it('in flowing mode', function (done) {
            (function () {
                gulp.src(fixturesGlob)
                    .pipe(plumber({ errorHandler: false }))
                    .on('data', function () { })
                    .pipe(this.failingQueueStream)
                    .on('end', done);
            }).should.throw();
            done();
        });
    });

    beforeEach(function () {
        this.failingEmitStream = new es.through(function (file) {
            this.emit('data', file);
            this.emit('error', new Error('Bang!'));
        });
        var i = 0;
        this.failingQueueStream = new es.through(function (file) {
            this.queue(file);
            i ++;
            if (i === 2) {
                this.emit('error', new Error('Bang!'));
            }
        });
    });

    before(function (done) {
        gulp.src(fixturesGlob)
            .pipe(es.writeArray(function (err, array) {
                this.expected = array;
                done();
            }.bind(this)));
    });
});
