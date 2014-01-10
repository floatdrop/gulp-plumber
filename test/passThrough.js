/*global describe, it, before */
'use strict';

var should = require('should'),
    es = require('event-stream'),
    gulp = require('gulp');

delete require.cache[require.resolve('..')];
var plumber = require('../');
var fixturesGlob = ['./test/fixtures/*'];

describe('stream', function () {

    it('should emit `end` after source emit `finish`', function (done) {
        gulp.src(fixturesGlob)
            .pipe(plumber({ errorHandler: done }))
            .on('finish', done)
            .on('error', done);
    });

    it('should passThrough all incoming files', function (done) {
        gulp.src(fixturesGlob)
            .pipe(plumber({ errorHandler: done }))
            .pipe(es.writeArray(function (err, array) {
                array.should.eql(this.expected);
                done();
            }.bind(this)))
            .on('error', done);
    });

    it('should passThrough all incoming files with on(`data`) handler attached', function (done) {
        gulp.src(fixturesGlob)
            .pipe(plumber({ errorHandler: done }))
            .on('data', function (file) { should.exist(file); })
            .pipe(es.writeArray(function (err, array) {
                array.should.eql(this.expected);
                done();
            }.bind(this)))
            .on('error', done);
    });

    before(function (done) {
        gulp.src(fixturesGlob)
            .pipe(es.writeArray(function (err, array) {
                this.expected = array;
                done();
            }.bind(this)));
    });

});
