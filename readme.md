# copy-newer

Copy newer files only.

[![npm](https://img.shields.io/npm/v/copy-newer.svg?style=flat-square)](https://www.npmjs.com/package/copy-newer)
[![Build Status](https://img.shields.io/travis/seangenabe/copy-newer/master.svg?style=flat-square)](https://travis-ci.org/seangenabe/copy-newer)
[![Dependency Status](https://img.shields.io/david/seangenabe/copy-newer.svg?style=flat-square)](https://david-dm.org/seangenabe/copy-newer)
[![devDependency Status](https://img.shields.io/david/dev/seangenabe/copy-newer.svg?style=flat-square)](https://david-dm.org/seangenabe/copy-newer#info=devDependencies)
[![node](https://img.shields.io/node/v/copy-newer.svg?style=flat-square)](https://nodejs.org/en/download/)

## Usage

### API

```javascript
const copyNewer = require('copy-newer')
```

### copyNewer(src, dest, [opts])

Copies files to a destination directory.

* `src`: array|string - One or more [glob patterns](https://github.com/isaacs/minimatch#usage) to select for the files to copy.
* `dest`: string - The directory to copy to.
* `opts`: object - Optional. Options to send directly to `glob`.
  * `opts.interval`: number - Optional. The number of milliseconds to wait before a file is considered 'new'. Default: 1000
  * `opts.cwd`: string - Same as glob's. The current working directory in which to search. Defaults to `process.cwd()`. (Included here because you'll most likely need it.)
  * `opts.verbose`: boolean - enable verbose logging to stdout. Defaults to `false`: no output ever occurs.
  * Other options can be found on [glob](https://github.com/isaacs/minimatch)'s documentation.
* **Returns:** `Promise`: Resolved when all file operations complete.
  Note: The resolved value is not empty, but it isn't useful either, for now. It's just an array of booleans that indicate whether each copy operation was done or skipped. For directories, a literal string `dir` will be represented in the output.

Note: `fs.stat` has a millisecond resolution while `fs.utimes` has a second resolution, hence the 1000 ms `opts.interval`. While node.js stays this way, changing `opts.interval` to a value lower than 1000 is not recommended.

### CLI

```bash
copy-newer --cwd cwd src dest
```

Copies globbed files from `src` mounted on `cwd` to `dest`.

**Example**

Copy the contents of "folder1" to "folder2":
```bash
copy-newer --cwd folder1 ** folder2
```

**Options**

* `-v`, `--verbose` - set `opts.verbose`
* `--cwd` - set `opts.cwd`

All options are passed-through to `glob` via minimist, although only `--cwd` will be officially supported. (The issue here is glob isn't a CLI in the first place. Again, if anyone wants to discuss, hit up on Github.)

## Similar packages

* [gulp-newer](https://www.npmjs.com/package/gulp-newer)
* [grunt-newer](https://www.npmjs.com/package/grunt-newer)

## License

MIT
