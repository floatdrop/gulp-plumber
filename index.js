'use strict';

var Duplex = require('stream').Duplex;
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
    if (EE.listenerCount(this, 'error') < 2) {
        gutil.log(
            gutil.colors.cyan('Plumber') + ' found unhandled error:',
            gutil.colors.red(trim(error.toString())));
    }
}

function plumber(opts) {
    opts = opts || {};

    var through = new Duplex({ objectMode: true });
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

    through.pipe2 = function pipe2(dest) {
        if (dest._plumbed) { return dest.pipe(dest); }

        Duplex.prototype.pipe.apply(this, arguments);

        // Patching pipe method
        if (opts.inherit !== false) {
            dest.pipe = this.pipe2.bind(dest);
            dest._plumbed = true;
        }

        // Wrapping panic onerror handler
        var oldHandler = removeDefaultHandler(dest, 'error');
        if (oldHandler) {
            dest.on('error', function onerror2(er) {
                if (EE.listenerCount(this, 'error') === 1) {
                    oldHandler.call(dest, er);
                }
            });
        }

        // Placing custom on error handler
        if (this.errorHandler) {
            dest.errorHandler = this.errorHandler;
            dest.on('error', this.errorHandler.bind(dest));
        }

        return dest;
    }.bind(through);

    through.pipe = through.pipe2;

    return through;
}

module.exports = plumber;
