'use strict'

const minimist = require('minimist')
const copyNewer = require('..')
const Path = require('path')
const pify = require('pify')
const mkdirp = pify(require('mkdirp'))
const Util = require('util')
const log = Util.debuglog('copy-newer')

let argv = minimist(process.argv.slice(2), {
  alias: {
    verbose: 'v'
  },
  'default': {
    verbose: false
  },
  'boolean': [
    'verbose'
  ]
})

argv.matchBase = argv.matchbase

if (argv._.length < 2) {
  console.error("Invalid number of arguments.")
}

let src = argv._[0]
let dest = argv._[1]
if (argv._[2]) { argv.cwd = argv._[2] }
let { verbose } = argv

module.exports = async () => {
  try {
    log(
      `copy-newer cli called with src=${src}, dest=${dest}, argv=${Util.inspect(argv)}`
    )
    await copyNewer(src, dest, argv)
  }
  catch (err) {
    console.error(err.stack)
    process.exit(1)
  }
}

module.exports.dir = async () => {
  try {
    let srcname = Path.basename(src)
    let pattern = argv._[2] ? argv._[2] : '**'
    argv.cwd = src
    let realdest = `${dest}/${srcname}`
    log(
      `copy-newer-dir cli called with pattern=${pattern}, realdest=${realdest}, argv=${Util.inspect(argv)}`
    )
    await mkdirp(realdest)
    await copyNewer(pattern, realdest, argv)
  }
  catch (err) {
    console.error(err.stack)
    process.exit(1)
  }
}
