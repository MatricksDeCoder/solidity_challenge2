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

  let token, result, snapShot, snapshotId, resultEvent
  let amount = 400000 

  describe('During Window Period Open', () => {

    describe('transfer() and transferFrom()', async () => {

      beforeEach(async() => {
        token = await Token.new(startTime, endTime, name, symbol, tokenFormat(totalSupply)) 
        // take snapshot of chain now to use for reverting
        snapShot = await advances.takeSnapshot();
        snapshotId = snapShot['result'];
        await advances.advanceTimeAndBlock(advances.advanceJustAfter(startTime)); //advance to beyond endTim
      })
       
      afterEach(async() => {
         // revert blocks and time to original snapshot
        await advances.revertToSnapShot(snapshotId);
      })

      it('is open after moving time ahead', async() => {
        result = await token.isOpen()
        assert.equal(result, true)
      })

      describe('transfer()', async () => {
  
        it ('allows transfer() and updates balance recepient and sender', async() => {
          await token.transfer(account1, tokenFormat(amount), {from:deployer})
          assert.equal((await token.balanceOf(account1)).toString(), tokenFormat(amount).toString())
          assert.equal((await token.balanceOf(deployer)).toString(), tokenFormat(totalSupply- amount).toString())
        })
  
        it('emits Transfer event', async() => {
          resultEvent = await token.transfer(account1, tokenFormat(amount), {from:deployer})
          log = resultEvent.logs[0]
          log.event.should.eq('Transfer')
          evnt = log.args
          evnt.from.should.equal(deployer, 'from deployer is correct')
          evnt.value.toString().should.equal(tokenFormat(amount).toString(), 'amount tokens is correct')
          evnt.to.should.equal(account1, 'assigned spender is correct')
        })

      })

      describe('transferFrom()', async() => {

        beforeEach(async() => {
          await token.approve(account1, tokenFormat(amount), {from:deployer})
        })
  
        it ('allows transferFrom() and updates balance recepient and sender', async() => {
          await token.transferFrom(deployer, account2, tokenFormat(amount), {from:account1})
          assert.equal((await token.balanceOf(account2)).toString(), tokenFormat(amount).toString())
          assert.equal((await token.balanceOf(deployer)).toString(), tokenFormat(totalSupply- amount).toString())
        })
  
        it('emits Transfer event', async() => {
          resultEvent = await token.transferFrom(deployer, account2, tokenFormat(amount), {from:account1})
          log = resultEvent.logs[0]
          log.event.should.eq('Transfer')
          evnt = log.args
          evnt.from.should.equal(deployer, 'from deployer is correct')
          evnt.value.toString().should.equal(tokenFormat(amount).toString(), 'amount tokens is correct')
          evnt.to.should.equal(account2, 'assigned spender is correct')
        })
        
      })  
      
    await advances.revertToSnapShot(snapshotId);

    })

  })

})
