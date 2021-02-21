const RewardToken         = artifacts.require('RewardToken')
const Staker              = artifacts.require('Staker')

module.exports = async function(deployer) {
  
  const name        = "RewardToken"
  const symbol      = "RWT"
  const decimals    = 18
  const totalSupply = 7000000 //deply with initial supply 7million tokens (can choose any value or start without)
  const newDistributionSupply = 1000000 //mint 1000000 new tokens to give as staking reward every n blocks
  const blocksSchedule  = 4  // reward for staking every 4 blocks (approx every minute) ideal for testing local

  await deployer.deploy(RewardToken, name, symbol, totalSupply, decimals)
  await deployer.deploy(Staker,RewardToken.address, newDistributionSupply, blocksSchedule)

};