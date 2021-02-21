// SPDX-License-Identifier: MIT
// Code adopted from https://medium.com/@tnhollan/how-to-implement-staking-in-solidity-cdb1d0506ef6
// Input is also from my own code https://github.com/MatricksDeCoder/Fojini-DEX 

pragma solidity ^0.7.3;

import "./RewardToken.sol";
// Library SafeMath used to prevent overflows and underflows 
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * @title Staker Contract 
 * @dev   Staking Contract mints new tokens every number blocks eg 100 and distributes proportion to stakers amount staked
 */
 
contract Staker {
    using SafeMath for uint256;

    // address RewardToken
    RewardToken public rewardToken;
    
    // time/block staking contract started
    uint public stakeStartBlock;    
    // total number of reward distributions since start
    uint public totalRewardCycles;
    // distibution amount per period
    uint public newDistributionSupply;

    // block schedule for rewards e.g every 100 blocks
    uint public blocksSchedule;
    // last block distribution occured
    uint public lastSchedule;

    // 
    // number of stakers 
    uint public totalStakers;
    // total amounts of RewardTokens staked
    uint public totalStaked;
    // collection of all the stakers
    address[] internal stakers;

    // staked amount balances of the stakers
    mapping(address => uint256) internal stakeBalances;
    // reward amount balances of the stakers 
    mapping(address => uint256) internal rewardBalances;
    // total staked + rewards due to the staker
    mapping(address => uint256) internal totalBalances;

    // ensure only authozrized owners
    modifier isValidOwner() {
        require(rewardToken.isOwner(msg.sender), "Caller is not the owner");
        _;
    }

    // sufficient blocks have passed to give rewards
    modifier isValidSchedule() {
        require((block.number-lastSchedule) >= blocksSchedule);
        _;
    }

    // Event when someone stakes into the contract
    event Deposit(address indexed staker, 
                  uint    indexed amount,
                  uint    indexed blockNumber,
                  uint    balancesStake,
                  uint    balanceRewards,
                  uint    totalBalances
                 );
    // Event when someone withdraws amount from stake
    event  Withdrawal(address indexed staker, 
                      uint    indexed amount,
                      uint    indexed blockNumber,
                      uint    balancesStake,
                      uint    balanceRewards,
                      uint    totalBalances
                  );
    // Event when stakers are rewarded with RewardTokens 
    event  Reward(address indexed admin, 
                    uint    indexed amountDistributed,
                    uint    indexed totalRewardCycles
                  );

    constructor(address _rewardToken, uint _newDistributionSupply, uint _blocksSchedule) 
    {
        rewardToken     = RewardToken(_rewardToken);       
        stakeStartBlock = block.number;
        newDistributionSupply = _newDistributionSupply *10 **(18);
        blocksSchedule = _blocksSchedule;
        lastSchedule = stakeStartBlock;
    }

    /// @notice Get the current blockNumber
    /// @return returns the latest block number
    function latestBlock() external view returns(uint) {
        return block.number;
    }

    /// @notice Get the current amount of RewardTokens address has staked
    /// @param _staker address to query staked balance
    /// @return _stakedBalance the amount staked by address _staker
    function balanceStaked(address _staker) external view returns(uint _stakedBalance) {
        return stakeBalances[_staker];
    }

    /// @notice Get the current amount of RewardTokens address has earned as rewards for staking
    /// @param _staker address to query rewards balance
    /// @return _rewards the current amount of rewards earned by address _staker
    function balanceRewards(address _staker) external view returns(uint _rewards) {
        return rewardBalances[_staker];
    }

    /// @notice Get the total amount of RewardTokens address currently has (balanceStaked + balanceRewards)
    /// @param _staker address to query total balance
    /// @return _total the current amount of rewards earned by address _staker
    function balanceTotal(address _staker) external view returns(uint _total) {
        return totalBalances[_staker];
    }

    /// @notice Check if address is currently a staker in contract. 
    /// @notice If balanceStaked is zero through not having participated or withdrawals, address no longer staker
    /// @param _staker address to query if currently a staker
    /// @return _is the result true or false
    function isStaker(address _staker) public view returns(bool _is) {
        return (stakeBalances[_staker] > 0);
    }

    /// @notice Change the amount of new RewardTokens that can be minted to distribute as rewards
    /// @notice Only owner/admin can change this, new RewardTokens to distirbute must not be more than current supply
    /// @param _amount amount of new reward tokens that cna be distributed as rewards
    function changeDistributionAmount(uint _amount) isValidOwner() external {
        require(_amount > 0);
        newDistributionSupply = _amount;
    }

    /// @notice Change rate of reward distribution by changing blocksSchedule e.g every 4 blocks every 400 blocks etc 
    /// @param _newSchedule  number of blocks before distributing rewards to stakers
    function changeBlockSchedule(uint _newSchedule) isValidOwner() external {
        blocksSchedule = _newSchedule;
    }

    /// @notice Deposit RewardTokens into Staker Contract to earn staking rewards 
    /// @param _amount amount of RewardTokens to be staked 
    function deposit(uint _amount) external  {
        uint tokenbalanceDepositor = rewardToken.balanceOf(msg.sender);
        require(_amount > 0);
        require(tokenbalanceDepositor > 0 && _amount<= tokenbalanceDepositor);
        require(rewardToken.transferFrom(msg.sender, address(this), _amount));
        stakers.push(msg.sender);
        stakeBalances[msg.sender]  = stakeBalances[msg.sender].add(_amount);
        totalBalances[msg.sender]  = totalBalances[msg.sender].add(stakeBalances[msg.sender].add(rewardBalances[msg.sender]));
        totalStakers               = totalStakers.add(1);
        totalStaked                = totalStaked.add(_amount);
        emit Deposit(msg.sender, 
                     _amount,
                    block.number, 
                    stakeBalances[msg.sender],
                    rewardBalances[msg.sender],
                    totalBalances[msg.sender]
                    );
    }

    /// @notice internal helper function 
    /// @notice Withdraw a specified amount of given tokens
    /// @notice Withdrawal starts by taking out rewards first if amount exceeds rewards it reduces staked amount
    /// @notice if withdrawal results in staked amount = 0 you are no longer earning rewards and not considered a staker in project
    /// @param _amount amount of RewardTokens to be withdrawn 
    function _withdraw(uint _amount) internal {

        if(_amount <= rewardBalances[msg.sender]) {
            rewardBalances[msg.sender] = rewardBalances[msg.sender].sub(_amount);
        } else {
            uint _excess               = _amount.sub(rewardBalances[msg.sender]);
            rewardBalances[msg.sender] = 0;
            stakeBalances[msg.sender]  = stakeBalances[msg.sender].sub(_excess);

            totalStaked                = totalStaked.sub(_excess);

            if(stakeBalances[msg.sender] == 0) {
                totalStakers = totalStakers.sub(1);
                totalBalances[msg.sender] = 0;
                stakeBalances[msg.sender] = 0;
            }
        }
        
        emit Withdrawal(msg.sender, 
                        _amount,
                        block.number, 
                        stakeBalances[msg.sender],
                        rewardBalances[msg.sender],
                        totalBalances[msg.sender]
                    );

    }

    /// @notice  Withdraw an amount of RewardTokens
    /// @param _amount amount of RewardTokens to be withdrawn
    function withdrawPartial(uint _amount) external {
        require(_amount > 0);
        require(totalBalances[msg.sender] >= _amount);
        require(rewardToken.transfer(msg.sender, _amount)); 
        _withdraw(_amount);        
    }

    /// @notice Withdraw all your balances in project (stake + rewards ) 
    /// @notice Can no longer earn rewards and is considered non-staker
    function withdraw() external {
        require(isStaker(msg.sender));
        uint _total = totalBalances[msg.sender];
        require(rewardToken.transfer(msg.sender, _total)); 
        _withdraw(_total);
    }

    /// @notice Get the proportion of staked amount address to totalStaked and get proportion of new RewardTokens created
    /// @param _staker address to query (proprtion * totalStaked ) = reward to add
    /// @return returns reward amount for _staker
    function shareReward(address _staker, uint _newDistributionSupply) internal view returns(uint) {
        if(!isStaker(_staker)) {
            return 0;
        }
        return (stakeBalances[_staker].mul(_newDistributionSupply)).div(totalStaked);
    }

    /// @notice One of owners distirbutes rewards to stakers
    function reward() isValidSchedule() isValidOwner() external {
        rewardToken.mint(address(this),newDistributionSupply);
        totalRewardCycles = totalRewardCycles.add(1);
        lastSchedule    = block.number;
        for(uint i=0; i<totalStakers;i++) {
            address _staker   = stakers[i];
            if(isStaker(_staker)) {
                uint _rewardShare = shareReward(_staker, newDistributionSupply);            
                rewardBalances[_staker] = rewardBalances[_staker].add(_rewardShare);
                totalBalances[_staker]   = stakeBalances[_staker].add(rewardBalances[_staker]);
            }
        }
        emit Reward(
            msg.sender,
            newDistributionSupply,
            totalRewardCycles
        );

    }

}
