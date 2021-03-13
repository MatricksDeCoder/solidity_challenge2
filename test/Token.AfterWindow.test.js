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
  const EVM_REVERT_AFTER_CLOSED   = "Token transfer period closed"

  let token, result, snapShot, snapshotId
  let amount = 600000 

  describe('After Window Period Closed', () => {

    describe('transfer() and transferFrom()', async () => {

      beforeEach(async() => {
        token = await Token.new(startTime, endTime, name, symbol, tokenFormat(totalSupply)) 
        // take snapshot of chain now to use for reverting
        snapShot = await advances.takeSnapshot();
        snapshotId = snapShot['result'];
        await advances.advanceTimeAndBlock(advances.advanceJustAfter(endTime)); //advance to beyond endTim
      })
       
      afterEach(async() => {
         // revert blocks and time to original snapshot
        await advances.revertToSnapShot(snapshotId);
      })

      it('is closed after moving time ahead', async() => {
        result = await token.isOpen()
        assert.equal(result, false)
      })
      
      it ('rejects transfer with EVM_REVERT', async() => {
        await token.transfer(account1, tokenFormat(amount)).should.be.rejectedWith(EVM_REVERT_AFTER_CLOSED);
      })

      it ('rejects transferFrom with EVM_REVERT', async() => {
        await token.approve(account1, tokenFormat(amount), {from:deployer})
        await token.transferFrom(deployer, account2, tokenFormat(amount), {from:account1}).should.be.rejectedWith(EVM_REVERT_AFTER_CLOSED)
      })

    })

  })

})
