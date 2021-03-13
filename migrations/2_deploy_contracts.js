const Token          = artifacts.require('Token')
//const Contribution = artifacts.require('Contribution')
const configToken    = require('../token-config.js')
//const configContribution  = require('../../contribution-config.js')
const {tokenFormat}  = require('../helpers.js')

module.exports = async function(deployer) {

  // get initial Token Contract constructor parameters from config
  const {startTime, endTime, name, symbol, totalSupply}  = configToken 
  // get initial Contribution Contract constructor parameters from config
  //const {startTime, endTime, name, symbol, decimal, totalSupply}  = configContribution

  await deployer.deploy(Token, startTime, endTime, name, symbol, tokenFormat(totalSupply))
  //await deployer.deploy(Staker,RewardToken.address, newDistributionSupply, blocksSchedule)

};