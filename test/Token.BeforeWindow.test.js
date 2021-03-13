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
  const {startTime, endTime, name, symbol,totalSupply}  = configToken 

  // EVM revert messages
  const EVM_REVERT_BEFORE_OPEN   = "Token not yet open to transfers"

  let log, token, result, resultEvent, balanceBefore, snapShot, snapshotId
  let amount = 600000 

  before(async() => {
    token = await Token.new(startTime, endTime, name, symbol, tokenFormat(totalSupply))
  })

  describe('Before Window Period Open', () => {

    describe('transfer()', () => {

      //time is before startTime
      it('time now is before startTime', async() => {
        result = await token.startTime() > Math.floor(Date.now()/1000)
        assert.equal(result, true)
      })

      //isOpen is false as time is before startTime
      it('is initally closed  before moving time ahead', async() => {
        result = await token.isOpen()
        assert.equal(result, false)
      })
      
      it ('rejects transfer with EVM_REVERT', async() => {
        await token.transfer(account1, tokenFormat(amount)).should.be.rejectedWith(EVM_REVERT_BEFORE_OPEN);
      })
  })
    
  describe('transferFrom', async () => {   

    beforeEach(async() => {
      await token.approve(account1, tokenFormat(amount), {from:deployer})
    })

    //time is before startTime
    it('time now is before startTime', async() => {
      result = await token.startTime() > Math.floor(Date.now()/1000)
      assert.equal(result, true)
    })

    //isOpen is false as time is before startTime
    it('is initally closed  before moving time ahead', async() => {
      result = await token.isOpen()
      assert.equal(result, false)
    })
    
    it ('rejects transferFrom with EVM_REVERT', async() => {
      await token.transferFrom(deployer, account2, tokenFormat(amount), {from:account1}).should.be.rejectedWith(EVM_REVERT_BEFORE_OPEN);
    })
  })

  })

  

})
    

    