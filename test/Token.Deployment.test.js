const configToken  = require('../token-config.js')
const Token        = artifacts.require('Token')
const {etherFormat, tokenFormat, ZERO_ADDRESS} = require('../helpers.js');
const { assert } = require('chai');
const advances = require('../utils.js');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Token', async ([deployer, account1, account2]) =>  {
  
  // get initial Contract constructor parameters from config
  const {startTime, endTime, name, symbol,decimal, totalSupply}  = configToken 

  let token, result, pastTime, futureTime

  const EVM_REVERT_INVALID_START_TIME = "startTime must at least greater than now and not in the past"
  const EVM_REVERT_INVALID_END_TIME = "endTime must be greater than startTime"

  describe("Deployment", ()  => {

    before(async() => {
      token = await Token.new(startTime, endTime, name, symbol, tokenFormat(totalSupply))
    })

    it('tracks correct name', async () => {
        result = await token.name()
        assert.equal(result, name)
    })    
    it('tracks correct symbol', async ()  => {
        result = await token.symbol()
        assert.equal(result, symbol)
    })   
    it('tracks correct decimals', async ()  => {
        result = await token.decimals()
        assert.equal(result.toString(), decimal.toString())
    })    
    it('tracks correct total supply', async ()  => {
        result = await token.totalSupply()
        assert.equal(result.toString(),tokenFormat(totalSupply).toString())
    })   
    it('assigns the total supply to the deployer', async ()  => {   
        result = await token.balanceOf(deployer)
        assert.equal(result.toString(),tokenFormat(totalSupply).toString())
    })

    it('has the correct startTime', async ()  => {   
      result = await token.startTime()
      assert.equal(result.toString(),(startTime+0).toString())
    })

    it('has the correct endTime', async ()  => {   
      result = await token.endTime()
      assert.equal(result.toString(),endTime.toString())
    })
    // for startTime that is ahead
    it('starts with isOpen false', async ()  => {   
      result = await token.isOpen()
      assert.equal(result, false)
    })   

  });

  describe('startTime and endTime validity', () => {

    before(async() => {
      pastTime = advances.unixNow() - (advances.SECONDS_IN_DAY) // 1 day ago
      futureTime = advances.unixNow() + (advances.SECONDS_IN_DAY) // 1 day from now
    })

    it('reverts for invalid startTime from the past', async () => {
      // endTime may be greater than startTime, but startTime is in the past
      await Token.new(pastTime, futureTime, name, symbol, tokenFormat(totalSupply)).should.be.rejectedWith(EVM_REVERT_INVALID_START_TIME)
    })

    it('reverts for invalid endTime less than or equal to startTime', async () => {
      // startTime may be valid, but endTime is less than startTime
      await Token.new(futureTime, futureTime-10, name, symbol, tokenFormat(totalSupply)).should.be.rejectedWith(EVM_REVERT_INVALID_END_TIME)
    })

  })

});

