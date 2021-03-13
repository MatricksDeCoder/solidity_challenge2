// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

/**
 * @title Token is an ERC20 based on openzeppelin implementation;
 * @dev   Token has additional functionality that controls window period in which tokens can be transfered.
 */

// use existing ERC20 from OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
 
contract Token is ERC20 {

    // deployer/admin/owner who will be sending Token to contributors
    address public admin;

    // time after which window period opens and tokens can be transferable
    uint public startTime;

    // time after which window period closes and tokens cant be transferred
    uint public endTime;

    // ensure transfers only take place in window period
    modifier onlyWhileOpen() {
        require(block.timestamp >= startTime, "Token not yet open to transfers");
        require(block.timestamp <= endTime, "Token transfer period closed");
        _;
    }

    constructor(
                uint _startTime,
                uint _endTime,
                string memory _name,
                string memory _symbol,
                uint _totalSupply 
               ) 
    ERC20(_name, _symbol) 
    {  
        
        require(_startTime >= block.timestamp, "startTime must at least greater than now and not in the past");
        require(_endTime > _startTime, "endTime must be greater than startTime");
        // set admin
        admin = msg.sender;
        // initial token supply to admin/owner/deployer
        _mint(msg.sender, _totalSupply);

        startTime = _startTime;
        endTime  = _endTime;
    }    

    // @return true if window period open and not closed, transfers are allowed
    function isOpen() external view returns (bool) {
        return (block.timestamp >= startTime) && (block.timestamp <= endTime);
    }

    /**
     * @notice Transfer `amount` tokens from `msg.sender` to 'recepient' (overrride original ERC20 by adding access modifier)
     * @notice Access modifier onlyWhileOpen added to ensure transfers allowable only in window period
     * @param recipient The address of the destination account
     * @param amount The number of tokens to transfer
     * @return Whether or not the transfer succeeded
     */
    function transfer(address recipient, uint256 amount) public override onlyWhileOpen returns (bool) {
        return super.transfer(recipient, amount);
    }

     /**
     * @notice Transfer `amount` tokens from sender to recipient by approved spender (override original ERC20 by adding access modifier)
      * @notice Access modifier onlyWhileOpen added to ensure transfers allowable only in window period
     * @param sender The address of the source account
     * @param recipient The address of the destination account
     * @param amount The number of tokens to transfer
     * @return Whether or not the transfer succeeded
     */

     function transferFrom(address sender, address recipient, uint256 amount) public override onlyWhileOpen returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }        

}