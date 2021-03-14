const configToken  = require('../token-config.js')
const configContribution  = require('../contribution-config.js')
const Token        = artifacts.require('Token')
const Contribution = artifacts.require('Contribution')
const {etherFormat, tokenFormat, ZERO_ADDRESS} = require('../helpers.js');
const { assert } = require('chai');
const advances = require('../utils.js');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Contribution', async ([deployer, account1, account2]) =>  {
  
  // get initial Contract constructor parameters from config
  const {startTime, endTime, name, symbol,totalSupply}  = configToken 
  // get initial Contribution Contract constructor parameters from config
  const {nameContract, price}  = configContribution

  let token, contrib, result, snapShot, snapshotId, resultEvent, tokenAdmin, addressContrib, balance
  let amount = 1

  // EVM revert messages
  const EVM_REVERT_ETHER_ZERO   = "Must send some Ether amount"
  const EVM_REVERT_CLOSED   = 'Window period for transfers must be open'
  const EVM_REVERT_TOKEN_FINISHED  = "Tokens must still be available"

  describe('deployment', async () => {

    beforeEach(async() => {
      token = await Token.new(startTime, endTime, name, symbol, tokenFormat(totalSupply)) 
      tokenAdmin = await token.admin()
      contrib = await Contribution.new(token.address, nameContract, tokenAdmin)
      addressContrib = contrib.address
      // Admin/Deployer token contract with total supply approves Conribution Contract to be a spender on behalf
      await token.approve(addressContrib, tokenFormat(totalSupply))
    })

    it('tracks correct name', async () => {
      result = await contrib.name()
      assert.equal(result, nameContract)
    })    
    it('tracks price', async ()  => {
        result = await contrib.price()
        assert.equal(result.toString(), '1')
    })   
    it('tracks correct Token address', async ()  => {
        result = await contrib.token()
        assert.equal(result, token.address)
    })    

    it('tracks Token admin', async () => {
      result = await contrib.tokenAdmin()
      assert.equal(result, tokenAdmin)
    })

  })
  
  describe('contribution()', async() => {

    /*
    To do tests for balances, sending ether, reverts window period closed, tokens finished, etc 
    */

  })

})