
var FS = require('fs-promise') // lol.

var fsPromisePath = require.resolve('fs-promise')

;(async () => {
  try {
    var src = await FS.readFile(fsPromisePath, {encoding: 'utf8'})
    src = src.replace(`require('any-promise')`,`require('babel-runtime/core-js/promise')['default']`)

    await FS.writeFile('lib/fs-promise.js', src, {encoding: 'utf8'})
  }
  catch (err) {
    console.error(err.stack)
    process.exit(1)
  }
})()
