/*global describe, it, before */
'use strict';

var es = require('event-stream'),
    gulp = require('gulp');

delete require.cache[require.resolve('..')];

var plumber = require('../');
var fixturesGlob = ['./test/fixtures/*'];

describe('unpipe', function () {

    it('should not keep piping after error', function (done) {
        var expected = [1, 3, 5];

        var badBoy = es.through(function (data) {
            if (data % 2 === 0) {
                return this.emit('error', new Error(data));
            }
            this.emit('data', data);
        });

        var badass = es.through(function (data) {
            if (data === 5) {
                return this.emit('error', new Error('Badass'));
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
            .pipe(plumber.stop())
            .pipe(badass)
            .on('error', function (err) {
                err.should.eql(new Error('Badass'));
                actual.should.eql(expected);
                done();
            })
            .on('end', function () {
                done('Error was not fired');
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
