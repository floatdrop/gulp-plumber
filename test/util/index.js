'use strict';

var through = require('through');

module.exports.noop = function () {
	return through(function (data) {
		this.queue(data);
	});
};
