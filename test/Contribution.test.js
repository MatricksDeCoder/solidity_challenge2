//const configContribution  = require('../../contribution-config.js')
const Contribution         = artifacts.require('Contribution')
//const {etherFormat, tokenFormat, ZERO_ADDRESS} = require('../helpers.js')

contract('Contribution', ([deployer, account1, account2]) =>  {
  /*
  // get initial Contract constructor parameters from config
  const {startTime, endTime, name, symbol, decimal, totalSupply}  = configContribution
  let accounts,contrib, result

  before(async function() {
    contrib = await Token.new(startTime, endTime, name, symbol, decimal, totalSupply)
  });

  describe("Deployment", ()  => {

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
        assert.equal(result.toString(), decimals.toString())
    })    
    it('tracks correct total supply', async ()  => {
        result = await token.totalSupply()
        assert.equal(result.toString(),tokenFormat(initialSupplyBTRUST).toString())
    })   
    it('assigns the total supply to the deployer', async ()  => {   
        result = await token.balanceOf(deployer)
        assert.equal(result.toString(),tokenFormat(totalSupply).toString())
     })
  });

  */

});