const Token          = artifacts.require('Token')
const Contribution   = artifacts.require('Contribution')
const configToken    = require('../token-config.js')
const configContribution  = require('../contribution-config.js')
const {tokenFormat}  = require('../helpers.js')


module.exports = async (deployer, _network, addresses) => {

  // get initial Token Contract constructor parameters from config
  const {startTime, endTime, name, symbol, totalSupply}  = configToken 
  // get initial Contribution Contract constructor parameters from config
  const {nameContract}  = configContribution
  
  await deployer.deploy(Token, startTime, endTime, name, symbol, tokenFormat(totalSupply))
  const token = await Token.deployed()
  const tokenAdmin = await token.admin()
  await deployer.deploy(Contribution,token.address, nameContract, tokenAdmin)
  const contrib = await Contribution.deployed()
  // Admin/Deployer token contract with total supply approves Conribution Contract to be a spender on behalf
  await token.approve(contrib.address, tokenFormat(totalSupply))

};