'use strict'

var copyNewer = require('./copy')
var FS = require('fs-promise')
var Path = require('path')
var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect

describe('copyNewer', function() {

  this.timeout(5000)

  let a = Path.join(__dirname, 'a.txt')
  let b = Path.join(__dirname, 'b.txt')

  async function unlinkIgnore(file) {
    try { await FS.unlink(a) } catch (err) {}
  }

  async function reset() {
    await Promise.all([unlinkIgnore(a), unlinkIgnore(b)])
  }

  function timeout(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms))
  }

  before(reset)
  after(reset)

  it('should copy successfully', async function() {
    await FS.writeFile(a, 'foo', {encoding: 'utf8'})
    let astat = await FS.stat(a)
    let op = copyNewer(a, b, {})
    expect(op).to.be.an.instanceof(Promise)
    await expect(op).to.eventually.deep.have.members([ true ])
    let bstat = await FS.stat(b)
    expect(astat.mtime - bstat.mtime).to.be.closeTo(0, 1000)
    expect(await FS.readFile(b, {encoding: 'utf8'})).to.equal('foo')
  })

  it('should not copy', async function() {
    let op = copyNewer(a, b, {})
    await expect(op).to.eventually.deep.have.members([ false ])
    expect((await FS.stat(a)).mtime - (await FS.stat(b)).mtime)
      .to.be.closeTo(0, 1000)
    expect(await FS.readFile(b, {encoding: 'utf8'})).to.equal('foo')
  })

  it('should copy', async function() {
    this.timeout(8000)
    await timeout(3000)
    await FS.writeFile(a, 'bar')
    let op = copyNewer(a, b, {})
    await expect(op).to.eventually.deep.have.members([ true ])
    expect((await FS.stat(a)).mtime - (await FS.stat(b)).mtime)
      .to.be.closeTo(0, 1000)
    expect(await FS.readFile(b, {encoding: 'utf8'})).to.equal('bar')
  })

})
