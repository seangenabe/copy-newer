'use strict'

const pify = require('pify')
const globby = require('globby')
const FS_orig = require('graceful-fs')
const FS = pify(FS_orig, { exclude: [ /.+Sync$/, /.+Stream$/]})
const fsWriteStreamAtomic = require('fs-write-stream-atomic')
const mkdirp_orig = pify(require('mkdirp'))
const Util = require('util')
const log = Util.debuglog('copy-newer')

async function copyNewer(src, dest, opts = {}) {
  let { cwd = process.cwd() } = opts
  src = src.toString()
  dest = dest.toString()
  let files = await globby(src, opts)
  log(`globbed files: ${Util.inspect(files)}`)

  // Do copy operations in parallel.
  let operations = []
  for (let file of files) {
    let realfile = `${cwd}/${file}`
    let destpath = `${dest}/${file}`
    operations.push(copyNewerSingle(realfile, destpath, opts))
  }

  return await Promise.all(operations)
}

// Copies a single file.
// Returns 'dir' if directory, true if successful, false if not.
// Throws Error if not a file and not a directory.
async function copyNewerSingle(srcpath, destpath, opts) {

  let { interval = 1000, verbose = false } = opts

  let stat = await FS.stat(srcpath)
  // Stat and check the filesystem entry type.
  if (stat.isDirectory()) {
    // Directory, ensure destination exists and return.
    let made = await mkdirp(destpath)
    if (verbose && made) { console.log(`${made} - directory created`)}
    return 'dir'
  }
  else if (!stat.isFile()) {
    // Not a file.
    throw new Error("Not supported.")
  }

  let srcmtime = stat.mtime
  let destmtime
  try {
    // Stat destpath and get the mtime.
    destmtime = (await FS.stat(destpath)).mtime
  }
  catch (err) {
    // path does not exist
  }

  if (destmtime !== undefined && srcmtime - destmtime <= interval) {
    // destpath does not exist or mtime is equal, return.
    if (verbose) { console.log(`${srcpath} == ${destpath}`) }
    return false
  }

  // Ensure parent directory exists.
  await mkdirp(`${destpath}/..`)

  // Commence copying.
  let rs = FS.createReadStream(srcpath)
  let ws = FS.createWriteStream(destpath)
  rs.pipe(ws)
  await waitForStreamEnd(ws)

  // Set mtime to be equal to the source file.
  await FS.utimes(destpath, new Date(), stat.mtime)

  if (verbose) { console.log(`${srcpath} -> ${destpath}`) }
  return true
}

async function waitForStreamEnd(stream) {
  await new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('finish', resolve)
  })
}

function mkdirp(dir) {
  return mkdirp_orig(dir, {fs: FS_orig})
}

module.exports = copyNewer

if (require.main === module) {
  require('./cli.js')
}
