# :monkey: gulp-plumber
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverall Status][coverall-image]][coverall-url] [![Dependency Status][depstat-image]][depstat-url]

> Prevent pipe breaking caused by errors from [gulp](https://github.com/wearefractal/gulp) plugins

This :monkey:-patch plugin is fixing [issue with Node Streams piping](https://github.com/gulpjs/gulp/issues/91). For explanations, read [this small article](https://gist.github.com/floatdrop/8269868).

Briefly it replaces `pipe` method and removes standard `onerror` handler on `error` event, which unpipes streams on error by default.

## Usage :monkey:

First, install `gulp-plumber` as a development dependency:

```shell
npm install --save-dev gulp-plumber
```

Then, add it to you `gulpfile.js`:

```javascript
var plumber = require('gulp-plumber');
var coffee = require('gulp-coffee');

gulp.src('./src/*.ext')
	.pipe(plumber())
	.pipe(coffee())
	.pipe(gulp.dest('./dist'));
```

## API :monkey:

### :monkey: plumber([options])

Returns Stream, that fixes `pipe` methods on Streams that are next in pipeline.

#### options
Type: `Object` / `Function`
Default: `{}`

Sets options described below from its properties. If type is `Function` it will set `errorHandler`.

#### options.inherit
Type: `Boolean`
Default: `true`

Monkeypatch `pipe` functions in underlying streams in pipeline.

#### options.errorHandler
Type: `Boolean` / `Function`
Default: `true`

Handle errors in underlying streams and output them to console.
 * `function` passed - it will be attached to stream `on('error')`.
 * `false` passed - error handler will not be attached.
 * `undefined` - default error handler will be attached.

### plumber.stop()

This method will return default behaviour for pipeline after it was piped.

```javascript
var plumber = require('gulp-plumber');

gulp.src('./src/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(uglify())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./dist'));
```

## License :monkey:

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-plumber
[npm-image]: https://badge.fury.io/js/gulp-plumber.svg

[travis-url]: http://travis-ci.org/floatdrop/gulp-plumber
[travis-image]: https://secure.travis-ci.org/floatdrop/gulp-plumber.svg?branch=master

[coverall-url]: https://coveralls.io/r/floatdrop/gulp-plumber
[coverall-image]: http://img.shields.io/coveralls/floatdrop/gulp-plumber.svg


[depstat-url]: https://david-dm.org/floatdrop/gulp-plumber
[depstat-image]: https://david-dm.org/floatdrop/gulp-plumber.svg?theme=shields.io
