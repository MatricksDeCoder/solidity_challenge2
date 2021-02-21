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

const RewardToken     = artifacts.require('./RewardToken')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('RewardToken', ([deployer, receiver, exchange, owner2, owner3, owner4]) => {

    const name        = "RewardToken"
    const symbol      = "RWT"
    const decimals    =  18
    const totalSupply = 7000000 //deply with initial supply 7million tokens (can choose any value or start without)
    let token

    beforeEach( async () => {
        token = await RewardToken.new(name, symbol, totalSupply, decimals)
    })


    describe('deployment is ERC20 token all functionality working', () => {
        it('tracks the name', async () => {
        const result = await token.name()
        result.should.equal(name)
        })

        it('tracks the symbol', async ()  => {
        const result = await token.symbol()
        result.should.equal(symbol)
        })

        it('tracks the decimals', async ()  => {
        const result = await token.decimals()
        result.toString().should.equal(decimals.toString())
        })

        it('tracks the total supply', async ()  => {
        const result = await token.totalSupply()
        result.toString().should.equal(tokenFormat(totalSupply).toString())
        })

        it('assigns the total supply to the deployer', async ()  => {
        
        const result = await token.balanceOf(deployer)
        const totalSupplyValue = totalSupply*10**(decimals)
        result.toString().should.equal(tokenFormat(totalSupply).toString())
        })
    })

    describe('sending tokens', () => {
        let result
        let amount
    
        describe('success', () => {
            beforeEach(async () => {
                amount = tokenFormat(100)
                result = await token.transfer(receiver, amount, { from: deployer })
            })
        
            it('transfers token balances and updates balances', async () => {
                let balanceOf
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokenFormat(6999900).toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(tokenFormat(100).toString())
            })
        
            it('emits a Transfer event', () => {
                // Get event logs check all correct our emitted event is ...
                // event Transfer(address indexed from, address indexed to, uint256 value);
                const log = result.logs[0]
                log.event.should.eq('Transfer')
                const event = log.args
                event.from.toString().should.equal(deployer, 'from is correct')
                event.to.should.equal(receiver, 'to is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
            })
        })
    
        describe('failure', () => {
            it('rejects insufficient balances', async () => {
                let invalidAmount
                invalidAmount = tokenFormat(100000000) // 100 million - greater than total supply
                token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT)
                       
            })
        
            it('rejects invalid recipients', () => {
                token.transfer(0x0, amount, { from: deployer }).should.be.rejected
            })
        })
    })
    
    describe('approving tokens', () => {
        let result
        let amount
    
        beforeEach(async () => {
          amount =  tokenFormat(100)
          result = await token.approve(exchange, amount, { from: deployer })
        })
    
        describe('success', () => {
            it('allocates an allowance for delegated token spending on exchange', async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal(amount.toString())
            })
        
            it('emits an Approval event', () => {
                // Get event logs check all correct our emitted event is ...
                // event Approval(address indexed owner, address indexed spender, uint256 value);
                const log = result.logs[0]
                log.event.should.eq('Approval')
                const event = log.args
                event.owner.toString().should.equal(deployer, 'owner is correct')
                event.spender.should.equal(exchange, 'spender is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
            })    
        })
    
        describe('failure', () => {
            it('rejects invalid spenders', () => {
                token.approve(0x0, amount, { from: deployer }).should.be.rejected
            })
        })
    })

    describe('delegated token transfers', () => {
        let result
        let amount
    
        beforeEach(async () => {
          amount = tokenFormat(100)
          let c = await token.approve(exchange, amount, { from: deployer })
        })
    
        describe('success', () => {
            beforeEach(async () => {
                result = await token.transferFrom(deployer, receiver, amount, { from: exchange })
            })
        
            it('transfers token balances', async () => {
                let balanceOf
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokenFormat(6999900).toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(tokenFormat(100).toString())
            })
        
            it('resets the allowance', async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal('0')
            })
        
            it('emits a Transfer event', () => {
                // Get event logs check all correct our emitted event is ...
                // event Transfer(address indexed from, address indexed to, uint256 value);
                const log = result.logs[0]
                log.event.should.eq('Transfer')
                const event = log.args
                event.from.toString().should.equal(deployer, 'from is correct')
                event.to.should.equal(receiver, 'to is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
            })
        })
    
        describe('failure', () => {
            it('rejects insufficient amounts', () => {
                // Attempt transfer too many tokens
                const invalidAmount = tokenFormat(100000000)
                token.transferFrom(deployer, receiver, invalidAmount, { from: exchange }).should.be.rejectedWith(EVM_REVERT)
            })
        
            it('rejects invalid recipients', () => {
                token.transferFrom(deployer, 0x0, amount, { from: exchange }).should.be.rejected
            })
        })
    })

    describe('ownership and mint() has minting functionality and only owner can mint ', () => {

        it('token has owners and deployer is an owner ', async () => {
            const isOwner = await token.isOwner(deployer)
            isOwner.should.equal(true)
        })

        it('owner can assign a new owner of token', async () => {
            await token.setOwner(receiver, {from:deployer})
            const isOwner = await token.isOwner(receiver)
            isOwner.should.equal(true)                   
        })
    
        it('rejects trying to add owner from not an owner', () => {
            token.setOwner(exchange, { from: receiver}).should.be.rejected
        })

        it('allows owner to mint tokens', async() => {
            // double totalsupply and mint to receiver
            const extraSupply = tokenFormat(1000000)
            const newSupply   = tokenFormat(totalSupply + 1000000)
            await token.mint(receiver, extraSupply, {from:deployer});
            const balanceReceiver = await token.balanceOf(receiver)
            const _totalSupply     = await token.totalSupply()
            balanceReceiver.toString().should.equal(extraSupply.toString())
            _totalSupply.toString().should.equal((newSupply).toString())
        })

        it('rejects not an owner trying to mint tokens', () => {
            token.mint(exchange, tokenFormat(1000000), {from:receiver}).should.be.rejected
        })

        it('rejects adding owner trying to mint tokens', async () => {
            await token.setOwner(owner2, {from:deployer}); 
            await token.setOwner(owner3, {from:owner2}); //new onwer2 can successfully add 3rd and final owner
            token.setOwner(owner4, {from:owner3}).should.be.rejected
        })
    })

})