/*global describe, it, before */
'use strict';

var should = require('should'),
    es = require('event-stream'),
    gutil = require('gulp-util'),
    gulp = require('gulp');

delete require.cache[require.resolve('..')];

var plumber = require('../');
var fixturesGlob = ['./test/fixtures/*'];

describe('pipe', function () {

    it('should skip patching with `inherit` === false', function (done) {
        var lastNoop = gutil.noop();
        var mario = plumber({ inherit: false });
        gulp.src(fixturesGlob)
            .pipe(mario).pipe(gutil.noop()).pipe(gutil.noop()).pipe(lastNoop)
            .on('end', function () {
                should.not.exist(lastNoop._plumbed);
                done();
            });
    });

    describe('should be patched at itself and underlying streams', function () {
        it('in non-flowing mode', function (done) {
            var lastNoop = gutil.noop();
            var mario = plumber();
            var m = gulp.src(fixturesGlob)
                .pipe(mario).pipe(gutil.noop()).pipe(gutil.noop()).pipe(lastNoop)
                .on('end', function () {
                    should.exist(lastNoop._plumbed);
                    done();
                });
        });

        it('in flowing mode', function (done) {
            var lastNoop = gutil.noop();
            var mario = plumber();
            gulp.src(fixturesGlob)
                .pipe(mario)
                .on('data', function (file) { should.exist(file); })
                .pipe(gutil.noop()).pipe(gutil.noop()).pipe(lastNoop)
                .on('end', function () {
                    should.exist(lastNoop._plumbed);
                    done();
                });
        });
    });

    it('piping into second plumber should does nothing', function (done) {
        throw new Error('This test is hanging');

        var lastNoop = gutil.noop();
        var mario = plumber();
        gulp.src(fixturesGlob)
            .pipe(mario)
            .pipe(gutil.noop()).pipe(gutil.noop())
            .pipe(mario)
            .on('end', function () {
                should.exist(lastNoop._plumbed);
                done();
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
