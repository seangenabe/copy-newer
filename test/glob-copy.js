'use strict'

const test = require('ava')
const copyNewer = require('..')
const pify = require('pify')
const FS = pify(require('graceful-fs'))
const globby = require('globby')
const temp = pify(require('temp').track())
const mkdirp = pify(require('mkdirp'))
const Path = require('path')

let root

test.before(async t => {
  root = await temp.mkdir('')
  let c = Path.join(root, 'a', 'b', 'c')
  await mkdirp(c)
  await Promise.all([
    mkdirp(Path.join(root, 'd')),
    FS.writeFile(Path.join(c, 'text1.txt'), 'foo', { encoding: 'utf8' }),
    FS.writeFile(Path.join(c, 'text2.txt'), 'bar', { encoding: 'utf8' }),
    FS.writeFile(Path.join(c, 'json1.json'), '{}', { encoding: 'utf8' }),
    FS.writeFile(
      Path.join(root, 'a', 'b', 'text3.txt'), 'baz', { encoding: 'utf8'})
  ])
})

test.after(async t => {
  await temp.cleanup()
})

test('glob copy', async t => {
  let result = await copyNewer(
    '**\/*.txt',
    Path.join(root, 'd'),
    { cwd: Path.join(root, 'a/b'), verbose: true }
  )
  t.same(result, [true, true, true])
  let text1_contents = await FS.readFile(Path.join(root, 'd', 'c', 'text1.txt'), { encoding: 'utf8' })
  t.ok(text1_contents === 'foo')
  let text2_contents = await FS.readFile(Path.join(root, 'd', 'c', 'text2.txt'), { encoding: 'utf8' })
  t.ok(text2_contents === 'bar')
  let text3_contents = await FS.readFile(Path.join(root, 'd', 'text3.txt'), { encoding: 'utf8' })
  t.ok(text3_contents === 'baz')
})

test('blank', t => {
  return Promise.resolve()
})

/*
Before:
|- a
  |- b
    |- c
      |- text1.txt
      |- text2.txt
      |- json1.json
    |- text3.txt
|- d
After:
|- a ...
|- d
  |- c
    |- text1.txt
    |- text2.txt
  |- text3.txt
*/
