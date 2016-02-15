'use strict'

const test = require('ava')
const pify = require('pify')
const FS = pify(require('graceful-fs'))
const Path = require('path')
const temp = pify(require('temp').track())
const Delayer = require('delayer')
const copyNewer = require('..')

const a = 'a.txt'
let src
let src_a
let dest
let dest_a

test.before(async t => {
  await Promise.all([
    (async () => {
      src = await temp.mkdir('')
      src_a = Path.join(src, a)
    })(),
    (async () => {
      dest = await temp.mkdir('')
      dest_a = Path.join(dest, a)
    })()
  ])
})

test.after(async t => {
  await temp.cleanup()
})

test.serial('should copy for the first time', async t => {
  // create file
  await FS.writeFile(src_a, 'foo', { encoding: 'utf8' })
  // create lag for timestamp testing
  await new Delayer(2000).promise
  // stat created file
  let astat = await FS.stat(src_a)

  // do the thing
  let copyPromise = copyNewer(a, dest, { cwd: src })
  //t.true(copyPromise instanceof Promise) // sindresorhus/ava#130
  t.ok(copyPromise.constructor.name === 'Promise')
  let copyResult = await copyPromise
  // operation must copy the file for the first time (true)
  t.same(copyResult, [true])
  let destFileStat = await FS.stat(dest_a)
  // test if timestamp copied
  t.ok(Math.abs(astat.mtime - destFileStat.mtime) <= 1000)
  let destFileContents = await FS.readFile(dest_a, { encoding: 'utf8'})
  t.ok(destFileContents === 'foo')
})

test.serial('should do not copy when called a second time', async t => {
  // do the thing
  let copyResult = await copyNewer(a, dest, { cwd: src })
  // operation must not copy the file the second time (false)
  let src_a_mtime = (await FS.stat(src_a)).mtime
  let dest_a_mtime = (await FS.stat(dest_a)).mtime
  t.ok(Math.abs(src_a_mtime - dest_a_mtime) <= 1000)
  let dest_a_contents = await FS.readFile(dest_a, { encoding: 'utf8' })
  t.ok(dest_a_contents === 'foo')
})

test.serial('should copy when the file is edited', async t => {
  // create lag
  await new Delayer(2000).promise
  await FS.writeFile(src_a, 'bar')
  let copyResult =
    await copyNewer(a, dest, { cwd: src })
  // operation must copy because the file is newer (true)
  t.same(copyResult, [true])
  let src_a_mtime = (await FS.stat(src_a)).mtime
  let dest_a_mtime = (await FS.stat(dest_a)).mtime
  t.ok(Math.abs(src_a_mtime - dest_a_mtime) <= 1000)
  let dest_a_contents =
    await FS.readFile(dest_a, { encoding: 'utf8' })
  t.ok(dest_a_contents === 'bar')
})
