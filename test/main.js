/*global describe, it*/
'use strict';

var assert = require('assert'),
    EE = require('events').EventEmitter;

delete require.cache[require.resolve('..')];

var gutil = require('gulp-util'),
	plumber = require('../');

describe('gulp-plumber', function () {

    describe('options', function () {
        it('{ errorHandler: `false` } should not add error handlers to stream', function () {
            var stream = plumber({ errorHandler: false }).pipe(gutil.noop());
            assert.equal(EE.listenerCount(stream, 'error'), 1);
        });

        it('{ errorHandler: function } should accept custom function handler', function (done) {
            var stream = plumber({ errorHandler: done.bind(null, null) }).pipe(gutil.noop());
            assert.equal(EE.listenerCount(stream, 'error'), 2);
            stream.emit('error', new Error('Bang!'));
        });

        it('{ inherit: `false` } should disable propagation of pipe2 method', function () {
            var stream = plumber({ inherit: false }).pipe(gutil.noop()).pipe(gutil.noop());
            assert.equal(EE.listenerCount(stream, 'error'), 1);
        });
    });

    it('should attach error handler by default source stream', function (done) {
        var stream = gutil.noop();
        stream.pipe(plumber()).pipe(gutil.noop());
        stream.emit('error', new Error('Bang!'));
        done();
    });

    it('should attach error handler by default on destanation streams', function (done) {
        var stream = plumber().pipe(gutil.noop());
        stream.emit('error', new Error('Bang!'));
        done();
    });

    it('should remove default error handler from source stream', function (done) {
        var stream = gutil.noop();
        stream.pipe(plumber({ errorHandler: false })).pipe(gutil.noop());
        assert.equal(EE.listenerCount(stream, 'error'), 0);
        done();
    });

	it('should be piped after error', function (done) {
		var stream = plumber().pipe(gutil.noop());
        stream.pipe(gutil.noop());
        stream.emit('error', new Error('Bang!'));
        assert.equal(EE.listenerCount(stream, 'data'), 1);
        done();
	});

});
