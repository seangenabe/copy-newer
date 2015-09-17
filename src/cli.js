'use strict'

var minimist = require('minimist')
var copyNewer = require('./copy')

var argv = minimist(process.argv.slice(2))

if (argv._.length < 2) {
  console.error("Invalid number of arguments.")
}

let src = argv._[0]
let dest = argv._[1]

;(async () => {
  try {
    await copyNewer(src, dest)
  }
  catch (err) {
    console.error(err.stack)
    process.exit(1)
  }
})()
