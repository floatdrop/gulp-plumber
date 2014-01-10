'use strict';

var stream = require('stream');
var Stream = stream.Stream;
var Duplex = stream.Duplex;
var EE = require('events').EventEmitter;
var gutil = require('gulp-util');

function trim(str) { return str.replace(/^\s+|\s+$/g, ''); }

function removeDefaultHandler(stream, event) {
    var found = false;
    stream.listeners(event).forEach(function (item) {
        if (item.name === 'on' + event) {
            found = item;
            this.removeListener(event, item);
        }
    }, stream);
    return found;
}

function defaultErrorHandler(error) {
    // onerror2 and this handler
    if (EE.listenerCount(this, 'error') < 3) {
        gutil.log(
            gutil.colors.cyan('Plumber') + ' found unhandled error:',
            gutil.colors.red(trim(error.toString())));
    }
}

function plumber(opts) {
    opts = opts || {};

    var through = new Duplex({ objectMode: true });
    through._plumber = true;
    through._read = function plumberRead() {};
    through._write = function plumberWrite(file, encoding, done) {
        through.push(file);
        done();
    };

    if (opts.errorHandler !== false) {
        through.errorHandler = (typeof opts.errorHandler === 'function') ?
            opts.errorHandler :
            defaultErrorHandler;
    }

    through.on('finish', through.emit.bind(through, 'end'));

    function patchPipe(stream) {
        if (stream.pipe2) {
            stream._pipe = stream.pipe;
            stream.pipe = stream.pipe2;
            stream.once('readable', patchPipe.bind(null, stream));
            stream._plumbed = true;
        }
    }

    through.pipe2 = function pipe2(dest) {

        if (!dest) { throw new Error('Can\'t pipe to undefined'); }

        if (dest._plumbed) { return dest; }

        this._pipe.apply(this, arguments);

        dest.pipe2 = pipe2;

        // Patching pipe method
        if (opts.inherit !== false) {
            patchPipe(dest);
        }

        // Wrapping panic onerror handler
        var oldHandler = removeDefaultHandler(dest, 'error');
        if (oldHandler) {
            dest.on('error', function onerror2(er) {
                if (EE.listenerCount(this, 'error') === 1) {
                    oldHandler.call(dest, er);
                    this.removeListener('error', onerror2);
                }
            });
        }

        // Placing custom on error handler
        if (this.errorHandler) {
            dest.errorHandler = this.errorHandler;
            dest.on('error', this.errorHandler.bind(dest));
        }

        dest._plumbed = true;

        return dest;
    };

    patchPipe(through);

    return through;
}

module.exports = plumber;
