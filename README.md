# gulp-plumber [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> A plumber for [gulp](https://github.com/wearefractal/gulp)

This plugin is fixing [issue with Node Streams piping](https://github.com/gulpjs/gulp/issues/91).

For explanations, read [this small article](https://gist.github.com/floatdrop/8269868).

## Usage

First, install `gulp-plumber` as a development dependency:

```shell
npm install --save gulp-plumber
```

Then, add it to your `gulpfile.js`:

```javascript
var plumber = require('gulp-plumber');
var coffee = require('gulp-coffee');

gulp.src('./src/*.ext')
	.pipe(plumber())
	.pipe(coffee())
	.pipe(gulp.dest('./dist'));
```

## API

### plumber(options)

Returns Stream, that fixes `pipe` methods on Streams that are next in pipeline.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-plumber
[npm-image]: https://badge.fury.io/js/gulp-plumber.png

[travis-url]: http://travis-ci.org/floatdrop/gulp-plumber
[travis-image]: https://secure.travis-ci.org/floatdrop/gulp-plumber.png?branch=master

[depstat-url]: https://david-dm.org/floatdrop/gulp-plumber
[depstat-image]: https://david-dm.org/floatdrop/gulp-plumber.png
