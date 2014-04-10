/*global describe, it, before */
'use strict';

var should = require('should'),
    es = require('event-stream'),
    noop = require('./util').noop,
    gulp = require('gulp');

delete require.cache[require.resolve('..')];

var plumber = require('../');
var fixturesGlob = ['./test/fixtures/*'];

describe('pipe', function () {

    it('should keep piping after error', function (done) {
        var expected = [1, 3, 5];

        var badBoy = es.through(function (data) {
            if (data % 2 === 0) {
                return this.emit('error', new Error(data));
            }
            this.emit('data', data);
        });

        var actual = [];

        es.readArray([1, 2, 3, 4, 5, 6])
            .pipe(plumber())
            .pipe(badBoy)
            .pipe(es.through(function (data) {
                actual.push(data);
                this.emit('data', data);
            }))
            .on('error', function (err) { done(err); })
            .on('end', function () {
                actual.should.eql(expected);
                done();
            });
    });

    it('should skip patching with `inherit` === false', function (done) {
        var lastNoop = noop();
        var mario = plumber({ inherit: false });
        gulp.src(fixturesGlob)
            .pipe(mario)
            .pipe(noop())
            .pipe(noop())
            .pipe(lastNoop)
            .on('end', function () {
                should.not.exist(lastNoop._plumbed);
                done();
            });
    });

    describe('should be patched at itself and underlying streams', function () {
        it('in non-flowing mode', function (done) {
            var lastNoop = noop();
            var mario = plumber();
            var m = gulp.src(fixturesGlob)
                .pipe(mario)
                .pipe(noop())
                .pipe(noop())
                .pipe(lastNoop)
                .on('end', function () {
                    should.exist(lastNoop._plumbed);
                    done();
                });
        });

        it('in flowing mode', function (done) {
            var lastNoop = noop();
            var mario = plumber();
            gulp.src(fixturesGlob)
                .pipe(mario)
                .on('data', function (file) { should.exist(file); })
                .pipe(noop())
                .pipe(noop())
                .pipe(lastNoop)
                .on('end', function () {
                    should.exist(lastNoop._plumbed);
                    done();
                });
        });
    });

    it('piping into second plumber should does nothing', function (done) {
        var lastNoop = noop();
        gulp.src(fixturesGlob)
            .pipe(plumber())
            .pipe(noop()).pipe(noop())
            .pipe(plumber())
            .pipe(lastNoop)
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
