/*global describe, it*/
'use strict';

var fs = require('fs'),
	es = require('event-stream'),
	should = require('should');


var gutil = require('gulp-util'),
	plumber = require('../');

var testString = 'should be in array';

describe('gulp-plumber', function () {

	it('should be piped after error', function (done) {

		var error;

		var stream = plumber();

		stream.pipe(es.writeArray(function (err, array) {
			should.exist(error);
			should.exist(array);
			array.should.eql([ testString ]);
			done();
		}));

		stream.on('error', function (err) {
			error = err;
		});

		stream.emit('error', new Error('Bang!'));
		stream.write(testString);
		stream.end();
	});

});
