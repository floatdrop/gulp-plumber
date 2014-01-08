/*global describe, it, before, after */
'use strict';

var assert = require('assert'),
    EE = require('events').EventEmitter;

delete require.cache[require.resolve('..')];

var gutil = require('gulp-util'),
	plumber = require('../'),
    through = require('through');

var errorMessage = 'Bang!',
    errorMessageRe = /Bang!/g;

describe('gulp-plumber', function () {

    describe('options', function () {
        it('{ errorHandler: `false` } should not add error handlers to stream', function () {
            var stream = plumber({ errorHandler: false }).pipe(gutil.noop());
            assert.equal(EE.listenerCount(stream, 'error'), 1);
        });

        it('{ errorHandler: function } should accept custom function handler', function (done) {
            var stream = plumber({ errorHandler: done.bind(null, null) }).pipe(gutil.noop());
            assert.equal(EE.listenerCount(stream, 'error'), 2);
            stream.emit('error', new Error(errorMessage));
        });

        it('{ inherit: `false` } should disable propagation of pipe2 method', function () {
            var stream = plumber({ inherit: false }).pipe(gutil.noop()).pipe(gutil.noop());
            assert.equal(EE.listenerCount(stream, 'error'), 1);
        });
    });

    it('should inherit on(`error`) handlers', function (done) {
        var stream = gutil.noop();
        stream
            .pipe(plumber({ errorHandler: function (error) {
                assert.ok((/Bang!/g).test(error));
                done();
            } }))
            .pipe(gutil.noop())
            .pipe(new through(function () {
                this.emit('error', new Error('Bang!'));
            }));
        stream.emit('data', 'This should be good');
    });

    it('should inherit on(`error`) handlers with `data` handler', function (done) {
        var expected = 'This should be good';
        var stream = gutil.noop();
        stream
            .pipe(plumber({ errorHandler: function (error) {
                assert.ok((/Bang!/g).test(error));
                done();
            } }))
            .on('data', function (data) {
                assert.equal(data, expected);
            })
            .pipe(gutil.noop())
            .pipe(new through(function () {
                this.emit('error', new Error('Bang!'));
            }));
        stream.emit('data', expected);
    });

    it('should attach error handler by default source stream', function (done) {
        var stream = gutil.noop();
        stream.pipe(plumber()).pipe(gutil.noop());
        stream.emit('error', new Error(errorMessage));
        done();
    });

    it('should pause source, if dest write returning false', function (done) {
        var plumb = plumber();
        var dest = gutil.noop();
        plumb.pipe(dest);
        var _write = dest.write;
        plumb.pause = done;
        dest.write = function (chunk, encoding, callback) {
            _write(chunk, encoding, callback);
            return false;
        };
        plumb.write('data');
    });

    it('should attach error handler by default on destanation streams', function (done) {
        var stream = plumber().pipe(gutil.noop());
        stream.emit('error', new Error(errorMessage));
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
        stream.emit('error', new Error(errorMessage));
        assert.equal(EE.listenerCount(stream, 'data'), 1);
        done();
	});

    it('should pipe `data` events after error', function (done) {
        var stream = plumber().pipe(gutil.noop());
        var endStream = stream.pipe(gutil.noop());
        stream.emit('error', new Error(errorMessage));
        endStream.on('data', done.bind(null, null));
        stream.emit('data', 'Ok');
    });

    it('should set `continueOnError` if it `undefined`', function () {
        var mapStream = gutil.noop();
        mapStream.opts = {};
        plumber().pipe(mapStream);
        assert.strictEqual(mapStream.opts.continueOnError, true);
    });

    it('should call onend on dest stream', function (done) {
        var plumb = plumber();
        var stream = plumb.pipe(gutil.noop());
        stream.on('end', done);
        plumb.end();
    });

    it('should call onend on source stream', function (done) {
        var plumb = plumber();
        plumb.pipe(gutil.noop());
        plumb.on('end', done);
        plumb.end();
    });

    it('should not call onend on dest stream if end === `false`', function (done) {
        var plumb = plumber();
        var stream = plumb.pipe(gutil.noop(), { end: false });
        stream.on('end', done.bind(null, 'end called'));
        plumb.end();
        setTimeout(done, 10);
    });

    it('should call dest.destroy on source `close` event', function (done) {
        var plumb = plumber();
        var stream = plumb.pipe(gutil.noop());
        stream.destroy = done;
        plumb.emit('close');
    });

    it('should call source.resume on dest `drain` event', function (done) {
        var plumb = plumber();
        var stream = plumb.pipe(gutil.noop());
        plumb.resume = done;
        stream.emit('drain');
    });

    it('should not set `continueOnError` if it `false`', function () {
        var mapStream = gutil.noop();
        mapStream.opts = { continueOnError: false };
        plumber().pipe(mapStream);
        assert.strictEqual(mapStream.opts.continueOnError, false);
    });

    describe('throw', function () {
        it('on piping to undefined', function () {
            assert.throws(plumber().pipe,
                /Can't pipe to undefined/);
        });

        it('after cleanup', function (done) {
            var plumb = plumber({ errorHandler: false });
            var stream = plumb.pipe(gutil.noop());

            try {
                stream.emit('error', new Error(errorMessage));
            } catch (e) {
                if (!errorMessageRe.test(e)) { done(e); }
            }

            assert.equal(EE.listenerCount(plumb, 'data'), 0);
            assert.equal(EE.listenerCount(plumb, 'drain'), 0);
            assert.equal(EE.listenerCount(plumb, 'error'), 0);
            assert.equal(EE.listenerCount(plumb, 'close'), 0);

            assert.equal(EE.listenerCount(stream, 'data'), 0);
            assert.equal(EE.listenerCount(stream, 'drain'), 0);
            assert.equal(EE.listenerCount(stream, 'error'), 0);
            assert.equal(EE.listenerCount(stream, 'close'), 0);

            done();
        });

    });

});
