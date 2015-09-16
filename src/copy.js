'use strict'

var denodeify = require('denodeify')
var glob = denodeify(require('glob'))
var Path = require('path')
var FS = require('./fs-promise')
var mkdirp = denodeify(require('mkdirp'))

async function copyNewer(src, dest, opts = {}) {

  let files = await glob(src, opts)

  // Do copy operations in parallel.
  let operations = []
  for (let file of files) {
    let destpath = Path.join(dest, Path.relative(src, file))
    operations.push(copyNewerSingle(file, destpath, opts))
  }

  return await Promise.all(operations)
}

// Copies a single file.
// Returns 'dir' if directory, true if successful, false if not.
// Throws Error if not a file and not a directory.
async function copyNewerSingle(srcpath, destpath, opts) {

  let {interval = 1000} = opts

  let stat = await FS.stat(srcpath)
  // Stat and check the filesystem entry type.
  if (stat.isDirectory()) {
    // Directory, ensure destination exists and return.
    await mkdirp(destpath)
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
  }

  if (destmtime !== undefined && srcmtime - destmtime <= interval) {
    // destpath does not exist or mtime is equal, return.
    return false
  }

  // Commence copying.
  let rs = FS.createReadStream(srcpath)
  rs.pipe(FS.createWriteStream(destpath))
  await waitForStreamEnd(rs)

  // Set mtime to be equal to the source file.
  // NB: fs.utimes does not save milliseconds in Windows.
  await FS.utimes(destpath, new Date(), stat.mtime)

  return true
}

async function waitForStreamEnd(stream) {
  await new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('end', resolve)
  })
}

async function copyNewerWrapper(src, dest, opts, next) {

  // Optional opts argument.
  if (typeof opts === 'function') {
    next = opts
    opts = null
  }

  next = next || function() {}

  try {
    let ret = await copyNewer(src, dest, opts)
    next(null, ret)
    return ret
  }
  catch (err) {
    next(err)
    throw err
  }
}

module.exports = copyNewerWrapper
