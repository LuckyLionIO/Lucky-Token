const { ethers } = require('ethers')
const { expectRevert } = require("@openzeppelin/test-helpers");
const { assert } = require("chai");
const LuckyToken =  artifacts.require('LuckyToken');

const TOTAL_SUPPLY = '26000000000000000000000000'
const FAIR_LAUNCH = '1000000000000000000000000'
const WAR_CHEST = '5000000000000000000000000'
const ECOSYSTEM = '20000000000000000000000000'
const CAP = '100000000000000000000000000'

contract('LuckyERC20', ([minter, owner, warchest, ecosystem, other]) => {
  beforeEach(async () => {
    this.lucky = await LuckyToken.new(owner, warchest, ecosystem, {from: minter})
  })

  it('name, symbol, decimals, cap, totalSupply, balanceOf', async () => {
    assert.equal(await this.lucky.name(), 'Lucky')
    assert.equal(await this.lucky.symbol(), 'LUCKY')
    assert.equal((await this.lucky.decimals()).toString(), '18')
    assert.equal((await this.lucky.cap()).toString(), CAP)
    assert.equal((await this.lucky.totalSupply()).toString(), TOTAL_SUPPLY)
    assert.equal((await this.lucky.balanceOf(minter)).toString(), '0')
    assert.equal(((await this.lucky.balanceOf(owner)).toString()).toString(), FAIR_LAUNCH)
    assert.equal((await this.lucky.balanceOf(warchest)).toString(), WAR_CHEST)
    assert.equal((await this.lucky.balanceOf(ecosystem)).toString(), ECOSYSTEM)
  })

  it('approve', async () => {
    await this.lucky.approve(other, 1000, {from: owner})
    assert.equal((await this.lucky.allowance(owner, other)).toString(), '1000')
  })

  it('transfer', async () => {
    await this.lucky.transfer(other, 1000, {from: owner})
    assert.equal((await this.lucky.balanceOf(owner)).toString(), '999999999999999999999000')
    assert.equal((await this.lucky.balanceOf(other)).toString(), 1000)
  })

  it('transfer:fail', async () => {
    await expectRevert(this.lucky.transfer(other, '1000000000000000000000001', {from: owner}), 'ERC20: transfer amount exceeds balance')
    await expectRevert(this.lucky.transfer(owner, 1, {from: other}), 'ERC20: transfer amount exceeds balance')
  })

  it('transferFrom', async () => {
    await this.lucky.approve(other, 1000, {from: owner})
    await this.lucky.transferFrom(owner, other, 1000, {from: other})
    assert.equal((await this.lucky.allowance(owner, other)).toString(), '0')
    assert.equal((await this.lucky.balanceOf(owner)).toString(), '999999999999999999999000')
    assert.equal((await this.lucky.balanceOf(other)).toString(), '1000')
  })

  it('mint', async () => {
    await this.lucky.mint(owner, 1000, {from: owner})
    assert.equal((await this.lucky.balanceOf(owner)).toString(), '1000000000000000000001000')
  })

  it('mint:over cap', async () => {
    await expectRevert(this.lucky.mint(owner, '100000000000000000000000001', {from: owner}), "ERC20Capped: cap exceeded")
    assert.equal((await this.lucky.balanceOf(owner)).toString(), FAIR_LAUNCH)
  })
})