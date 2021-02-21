const { expect } = require('chai')
const { idText, createNoSubstitutionTemplateLiteral, isConstructorDeclaration } = require('typescript')

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
const EVM_REVERT    = 'VM Exception while processing transaction: revert'

// Helpers to format eth and token to full decimals wei and like wei
const etherFormat = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}

// Same as ether
const tokenFormat = (n) => etherFormat(n)

const Staker       = artifacts.require('./Staker')
const RewardToken  = artifacts.require('./RewardToken')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Staker', ([deployer, owner2, staker1, staker2]) => {

    const name        = "RewardToken"
    const symbol      = "RWT"
    const decimals    =  18
    const totalSupply = 7000000 //deply with initial supply 7million tokens (can choose any value or start without)
    const newDistributionSupply = 1000000 //mint 1000000 new tokens to give as staking reward every n blocks
    const blocksSchedule  = 4  // reward for staking every 4 blocks (approx every minute) ideal for testing local

    let rewardToken, stakeHouse, startProject,resultDeployer, resultOwner2, resultStaker1, resultStaker2, amountStaked,rewardOwener2, rewardStaker1

    beforeEach( async () => {
      amountStaked = tokenFormat(100000)
      rewardToken  = await RewardToken.new(name, symbol, totalSupply, decimals)
      stakeHouse   = await Staker.new(rewardToken.address, newDistributionSupply, blocksSchedule)
      startProject = await stakeHouse.stakeStartBlock()
      // make owner2 an admin/onwer for rewardToken
      await rewardToken.setOwner(owner2, {from:deployer})
      // deployer gives 500000 tokens to 2 of 3  each so they have balances to stake (staker 2 has no RewardTokens)
      await rewardToken.transfer(owner2, tokenFormat(500000), {from: deployer})
      await rewardToken.transfer(staker1, tokenFormat(500000), {from:deployer})
      // all approve Staker /StakeHouse to transfer tokens on behalf(each approves up to 500000)
      await rewardToken.approve(stakeHouse.address, tokenFormat(500000), {from: deployer})
      await rewardToken.approve(stakeHouse.address, tokenFormat(500000), {from:owner2})
      await rewardToken.approve(stakeHouse.address, tokenFormat(500000), {from: staker1})
      await rewardToken.approve(stakeHouse.address, tokenFormat(500000), {from: staker2})

      
    })

    describe('deployment and project start', () => {

      it('has correct rewardToken address', async () => {
        const rewardTokenAddress = await stakeHouse.rewardToken()
        rewardTokenAddress.should.equal(rewardToken.address)       
      })

      it('has a stakesStart Block keeps track of block which was start of staking project', async () => {
        const startBlock = await stakeHouse.stakeStartBlock()
        const currBlock  = await stakeHouse.latestBlock()
        expect(+currBlock.toString()).to.be.at.least(+startBlock.toString());
      })

      it('sets correctly initial newDistributionSupply (new RewardTokens value minted to reward for staking at specific schedule)', async () => {
        const mintNewRewards = await stakeHouse.newDistributionSupply()
        mintNewRewards.toString().should.equal(tokenFormat(newDistributionSupply).toString())
      })

      it('sets correctly initial blocks reward schedule( every 4 blocks mintNewRewards and distribute), sets number number blocks for this', async () => {
        const everyBlocks = await stakeHouse.blocksSchedule()
        everyBlocks.toString().should.equal(blocksSchedule.toString())
      })

      it('starts with no stakers', async () => {
        const numStakers = await stakeHouse.totalStakers()
        numStakers.toString().should.equal('0')
      })

      it('starts with zero amount staked in total amount staked', async () => {
        const totalStaked = await stakeHouse.totalStaked()
        totalStaked.toString().should.equal('0')
      })

      it('keeps track balances staked each address and starts at zero for everyone', async () => {
        const stakedDeployer = await stakeHouse.balanceStaked(deployer)
        const stakedOwner2   = await stakeHouse.balanceStaked(owner2)
        const stakedStaker1  = await stakeHouse.balanceStaked(staker1)
        const stakedStaker2  = await stakeHouse.balanceStaked(staker2)
        stakedDeployer.toString().should.equal('0')
        stakedOwner2 .toString().should.equal('0')
        stakedStaker1.toString().should.equal('0')
        stakedStaker2.toString().should.equal('0')

      })

      it('keeps track rewards each address and starts at zero for everyone', async () => {
        const rewardsDeployer = await stakeHouse.balanceRewards(deployer)
        const rewardsOwner2   = await stakeHouse.balanceRewards(owner2)
        const rewardsStaker1  = await stakeHouse.balanceRewards(staker1)
        const rewardsStaker2  = await stakeHouse.balanceRewards(staker2)
        rewardsDeployer.toString().should.equal('0')
        rewardsOwner2 .toString().should.equal('0')
        rewardsStaker1.toString().should.equal('0')
        rewardsStaker2.toString().should.equal('0')

      })

      it('keeps track total due to each address(staked +rewards) and starts at zero for everyone', async () => {
        const totalsDeployer = await stakeHouse.balanceTotal(deployer)
        const totalsOwner2   = await stakeHouse.balanceTotal(owner2)
        const totalsStaker1  = await stakeHouse.balanceTotal(staker1)
        const totalsStaker2  = await stakeHouse.balanceTotal(staker2)
        totalsDeployer.toString().should.equal('0')
        totalsOwner2 .toString().should.equal('0')
        totalsStaker1.toString().should.equal('0')
        totalsStaker2.toString().should.equal('0')
      })

      it('keeps track stakers as those who have above zero balance of stack', async () => {
        resultDeployer = await stakeHouse.isStaker(deployer)
        resultOwner2   = await stakeHouse.isStaker(owner2)
        resultStaker1  = await stakeHouse.isStaker(staker1)
        resultStaker2  = await stakeHouse.isStaker(staker2)
        resultDeployer.should.equal(false)
        resultOwner2.should.equal(false)
        resultStaker1.should.equal(false)
        resultStaker2.should.equal(false)
      })

      it('reward Contract keeps track that deployer and owner1 are owners/admins', async () => {
        resultDeployer = await rewardToken.isOwner(deployer)
        resultOwner2   = await rewardToken.isOwner(owner2)
        resultStaker1 = await rewardToken.isOwner(staker1)
        resultStaker2   = await rewardToken.isOwner(staker2)
        resultDeployer.should.equal(true)
        resultOwner2.should.equal(true)
        resultStaker1.should.equal(false)
        resultStaker2.should.equal(false)
      })

    })

    describe('deposit() staking functionality', () => {

        beforeEach(async () => {
          resultOwner2   = await stakeHouse.deposit(amountStaked, {from:owner2})
          resultStaker1  = await stakeHouse.deposit(amountStaked, {from:staker1})
        })

        it('deposits staked amounts into stakeHouse contract address', async () => {
          const balanceStakeHouse = await rewardToken.balanceOf(stakeHouse.address)
          // 2 stakers put in amountStaked 1000000 tokens = 200000 tokens total
          balanceStakeHouse.toString().should.equal(tokenFormat(200000).toString())
        })

        it('rejects deposit 0 tokens trying to stake 0 tokens', async () => {
          await stakeHouse.deposit(0, {from:staker1}).should.be.rejected
        })

        it('rejects staking amount above your RewardToken balances', async () => {
          await stakeHouse.deposit(tokenFormat(400000), {from:staker1}).should.be.fulfilled
          await stakeHouse.deposit(tokenFormat(400001), {from:staker1}).should.be.rejected
        })
        
        it('calls deposit event owner2', async () => {
          const log = resultOwner2.logs[0]
          log.event.should.eq('Deposit')
          const event = log.args

          event.staker.should.equal(owner2)
          event.amount.toString().should.equal(amountStaked.toString(), 'staked amount correct')
          expect(event.blockNumber).to.exist
          event.balancesStake.toString().should.equal(amountStaked.toString(), 'balances staked correct')
          event.balanceRewards.toString().should.equal('0', 'balance rewards correct (no distribution yet)')
          event.totalBalances.toString().should.equal(amountStaked.toString(), 'totalBalances(staked+rewards) are correct')
        })


        it('calls deposit event staker1', async () => {
          const log = resultStaker1.logs[0]
          log.event.should.eq('Deposit')
          const event = log.args
          event.staker.should.equal(staker1)
          event.amount.toString().should.equal(amountStaked.toString(), 'staked amount correct')
          expect(event.blockNumber).to.exist
          event.balancesStake.toString().should.equal(amountStaked.toString(), 'balances staked correct')
          event.balanceRewards.toString().should.equal('0', 'balance rewards correct (no distribution yet)')
          event.totalBalances.toString().should.equal(amountStaked.toString(), 'totalBalances(staked+rewards) are correct')
        })

        it('keeps track and updates total number of stakers', async () => {
          const totalStakers = await stakeHouse.totalStakers();
          totalStakers.toString().should.equal('2')
        })

        it('keeps track and total Amount staked', async () => {
          const totalStaked = await stakeHouse.totalStaked();
          // 2 stakers of 1000000 = total (200000)
          totalStaked.toString().should.equal(tokenFormat(200000).toString())
        })


        it('successfully tracks the deposit made', async () => {
            const balanceOwner2 = await stakeHouse.balanceStaked(owner2)
            const balanceStaker1 = await stakeHouse.balanceStaked(staker1)
            // staker2 has not staked so balaceStaked must remain 0
            const balanceStaker2 = await stakeHouse.balanceStaked(staker2)
            balanceOwner2.toString().should.equal(amountStaked.toString())
            balanceStaker1.toString().should.equal(amountStaked.toString())
            balanceStaker2.toString().should.equal('0')

        })

        it('successfully updates depositors as stakers in the project', async () => {
          const isStakerOwner2 = await stakeHouse.isStaker(owner2)
          const isStakerStaker1 = await stakeHouse.isStaker(staker1)
          // staker2 has not staked so isStaker() must remain false
          const isStakerStaker2  = await stakeHouse.isStaker(staker2)
          isStakerOwner2.should.equal(true)
          isStakerStaker1.should.equal(true)
          isStakerStaker2.should.equal(false)

        })

        it('successfully updates totalBalances due of stakers in the project', async () => {
          //no rewards distributed so totalBalances = amountsStaked by each address
          const  totalOwner1 = await stakeHouse.balanceTotal(owner2)
          const  totalStaker1 = await stakeHouse.balanceTotal(staker1)
          // staker2 has not staked so isStaker() must remain 0
          const  totalStaker2  = await stakeHouse.balanceTotal(staker2)
          totalOwner1.toString().should.equal(amountStaked.toString())
          totalStaker1.toString().should.equal(amountStaked.toString())
          totalStaker2.toString().should.equal('0')

        })

    })
    
    describe('distribution of rewards reward()', () => {

      beforeEach(async () => {


        await stakeHouse.deposit(amountStaked, {from:owner2})
        await stakeHouse.deposit(amountStaked, {from:staker1})

        // calculate rewards that will be due to stakers if staked till next schedule
        // based on amountStaked and totalStaked
        let totalsStaked  = await stakeHouse.totalStaked();
        totalsStaked      = +(totalsStaked.toString())
        console.log("TOTALS STAKED .........: ",totalsStaked)
        // distributionSupply has not changed from deployment = 1000000
        rewardsOwner2     = tokenFormat((+amountStaked/totalsStaked) * newDistributionSupply)
        rewardStaker1     = tokenFormat((+amountStaked/totalsStaked) * newDistributionSupply)

        lastSchedule       = await stakeHouse.lastSchedule()
        currBlock          = await stakeHouse.latestBlock()
        //console.log("LATEST BLOCK: ", +lastSchedule.toString())
        //console.log("CURR BLOCK :" , +currBlock.toString())

        //reward after correct schedule
        if((currBlock-lastSchedule) >= blocksSchedule) {
          resultRewardFulfil   = await stakeHouse.reward({from:owner2})
           // try to immediately reward by owner
          lastSchedule       = await stakeHouse.lastSchedule()
          currBlock            = await stakeHouse.latestBlock()
          console.log("Blocks since :", +currBlock.toString() - +lastSchedule.toString())
          stakeHouse.reward({from:owner2}).should.be.rejected
        }

      })      

      
      it('emits reward event', async () => {

        const log = resultRewardFulfil.logs[0]
        log.event.should.eq('Reward')
        const event = log.args
        const distributed = await stakeHouse.newDistributionSupply()
        event.admin.should.equal(owner2)
        event.amountDistributed.toString().should.equal(distributed.toString(), 'new minted RewardTokens distributed')
        event.totalRewardCycles.toString().should.equal('1', 'correct count reward cycles')
        
      })

      it('updates the rewardBalances of stakers', async () => {
        resultOwner2 = await stakeHouse.balanceRewards(owner2)
        resultStaker1 = await stakeHouse.balanceRewards(staker1)
        // staker2 has not staked so isNotStaker and gets no rewards
        resultStaker2 = await stakeHouse.balanceRewards(staker2)
        resultOwner2.toString().should.equal(rewardsOwner2.toString())
        resultStaker1.toString().should.equal(rewardStaker1.toString())
        resultStaker2.toString().should.equal('0')
        
      })

      it('updateds totalBalances of stakers', async() => {
        // totals = staked + rewards = e.g (100000 + rewardsOwner2)
        resultOwner2  = await stakeHouse.balanceTotal(owner2)
        resultStaker1 = await stakeHouse.balanceTotal(staker1)
        console.log("RESULT TOTALS :::::::::::::::::, ",resultOwner2.toString(),resultStaker1.toString())
        // staker2 has not staked so isNotStaker and gets no rewards and still has no stake
        // new totals are reward 500000(split of 1million) + initial staked (100000) tokens
        resultStaker2 = await stakeHouse.balanceTotal(staker2)
        resultOwner2.toString().should.equal(tokenFormat(600000).toString())
        resultStaker1.toString().should.equal(tokenFormat(600000).toString())
        resultStaker2.toString().should.equal('0')

      })

      it('updates total rewardCycles', async() => {
        const totalRewardCycles = await stakeHouse.totalRewardCycles()
        totalRewardCycles.toString().should.equal('1')
      })


      describe('withdrawals withdraw() become noStaker', () => {

        beforeEach( async () => {
          resultStaker1  = await stakeHouse.withdraw({from:staker1})
        })

        it('calls Withdraw event', async() => {
          const log = resultStaker1.logs[0]
          log.event.should.eq('Withdrawal')
          const event = log.args
          event.staker.should.equal(staker1)
          expect(event.blockNumber).to.exist
          event.balancesStake.toString().should.equal('0', 'updates balancesStaked to zero ')
          event.balanceRewards.toString().should.equal('0', 'updates balanceRewards to zero')
          event.totalBalances.toString().should.equal('0', 'updates totalRewards to zero')
        })

        it('updates staker balances', async () => {
          const rewards = await stakeHouse.balanceRewards(staker1);
          const staked  = await stakeHouse.balanceStaked(staker1);
          const totals  = await stakeHouse.balanceTotal(staker1);
          rewards.toString().should.equal('0', 'updates balancesStaked to zero ')
          staked.toString().should.equal('0', 'updates balanceRewards to zero')
          totals.toString().should.equal('0', 'updates totalRewards to zero')

        })

        it('updates that address no longer a staker', async() => {
          const isStaker = await stakeHouse.isStaker(staker1)
          isStaker.should.equal(false)
        })

        it('updates and reduces total Staked ', async() => {
          const totalStaked = await stakeHouse.totalStaked()
          //initially was 200000 now 100000 taken out
          totalStaked.toString().should.equal(tokenFormat('100000').toString())
        })

        it('rejects withdraw from staker with no balances ',() => {
          stakeHouse.withdraw({from:staker2}).should.be.rejected
        })

      })

      
      describe('withdrawals withdraw(uint amount) if amount equal to totalBalances will become nonStaker', () => {

        it('rejects withdraw 0 amount ',() => {
          stakeHouse.withdrawPartial(0, {from:owner2}).should.be.rejected
        })

        it('rejects amount exceeds total balances ', async () => {
          const totalBalances = await stakeHouse.balanceTotal(owner2)
          stakeHouse.withdrawPartial(0, {from:owner2}).should.be.rejected
        })

        beforeEach(async () => {
          const allAmount = await stakeHouse.balanceTotal(staker1)
          const someAmount = await stakeHouse.balanceRewards(owner2)
          resultStaker1 = await stakeHouse.withdrawPartial(allAmount, {from:staker1})
          resultOwner1  = await stakeHouse.withdrawPartial(someAmount, {from:owner2})
        })
        
        describe(' staker 1 took out all the amount', () => {
          it('updates staker balances', async () => {
            const rewards = await stakeHouse.balanceRewards(staker1);
            const staked  = await stakeHouse.balanceStaked(staker1);
            const totals  = await stakeHouse.balanceTotal(staker1);
            rewards.toString().should.equal('0', 'updates balancesStaked to zero ')
            staked.toString().should.equal('0', 'updates balanceRewards to zero')
            totals.toString().should.equal('0', 'updates totalRewards to zero')
  
          })
  
          it('updates that address no longer a staker', async() => {
            const isStaker = await stakeHouse.isStaker(staker1)
            isStaker.should.equal(false)
          })
  
          it('updates and reduces total Staked ', async() => {
            const totalStaked = await stakeHouse.totalStaked()
            //initially was 200000 now 100000 taken out
            totalStaked.toString().should.equal(tokenFormat('100000').toString())
          })
  
          it('rejects withdraw from staker with no balances ',() => {
            stakeHouse.withdraw({from:staker2}).should.be.rejected
          })
  
        })

        describe('owner1 only withdraw rewards ', () => {

        })

        


      })


    })


  })









  



