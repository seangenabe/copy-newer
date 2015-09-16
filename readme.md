# copy-newer

Copy newer files only.

[![npm](https://img.shields.io/npm/v/copy-newer.svg?style=flat-square)](https://www.npmjs.com/package/copy-newer)
[![Build Status](https://img.shields.io/travis/seangenabe/copy-newer/master.svg?style=flat-square)](https://travis-ci.org/seangenabe/copy-newer)
[![Dependency Status](https://img.shields.io/david/seangenabe/copy-newer.svg?style=flat-square)](https://david-dm.org/seangenabe/copy-newer)
[![devDependency Status](https://img.shields.io/david/dev/seangenabe/copy-newer.svg?style=flat-square)](https://david-dm.org/seangenabe/copy-newer#info=devDependencies)
[![node](https://img.shields.io/node/v/copy-newer.svg)](https://nodejs.org/en/download/)

## Usage

### API

```javascript
var copyNewer = require('copy-newer')
```

### copyNewer(src, dest, [opts], [next])

Copies files to a destination directory.

* `src`: string - A glob string to select for the files to copy.
* `dest`: string - The directory to copy to.
* `opts`: string - Optional. Options to send directly to `glob`.
  * `opts.interval`: number - Optional. The number of milliseconds to wait before a file is considered 'new'. Default: 1000
* `next`: Function<Error> - Optional. Node-style callback. Called when all file operations complete.

Returns a `Promise` that resolves when all file operations complete.

Note: In Windows, fs.utimes does not save the milliseconds portion of the date, hence the default 1000 ms interval. If anyone can get around this or have some suggestions, drop by the Github project page.

### CLI

```bash
copy-newer src dest
```

## Similar packages

* [gulp-newer](https://www.npmjs.com/package/gulp-newer)
* [grunt-newer](https://www.npmjs.com/package/grunt-newer)

## License

MIT
