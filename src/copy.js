'use strict'

const pify = require('pify')
const globby = require('globby')
const Path = require('path')
const FS = pify(require('graceful-fs'), { exclude: [ /.+Sync$/, /.+Stream$/]})
const mkdirp = pify(require('mkdirp'))

async function copyNewer(src, dest, opts = {}) {

  let files = await globby(src, opts)
  let { cwd = process.cwd() } = opts

  // Do copy operations in parallel.
  let operations = []
  for (let file of files) {
    let realfile = Path.join(cwd, file)
    let destpath = Path.join(dest, file)
    console.log('destpath', destpath)
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
    await mkdirp(destpath)
    if (verbose) { console.log(`${srcpath} - directory created`) }
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
    if (verbose) { console.log(`${srcpath} - not copied to ${destpath}`) }
    return false
  }

  // Commence copying.
  let rs = FS.createReadStream(srcpath)
  let ws = FS.createWriteStream(destpath)
  rs.pipe(ws)
  await waitForStreamEnd(ws)

  // Set mtime to be equal to the source file.
  // NB: fs.utimes does not save milliseconds in Windows.
  await FS.utimes(destpath, new Date(), stat.mtime)

  if (verbose) { console.log(`${srcpath} - copied to ${destpath}`) }
  return true
}

async function waitForStreamEnd(stream) {
  await new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('finish', resolve)
  })
}

module.exports = copyNewer

if (require.main === module) {
  require('./cli.js')
}
