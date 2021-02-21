// SPDX-License-Identifier: MIT

pragma solidity ^0.7.3;

// use existing ERC20 from OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title RewardToken is an ERC20 for Staking 
 * @dev   RewardToken, based openzeppelin ERC20 contract with  supply determined at initializaiton and minted to deployer.
 */
 
contract RewardToken is ERC20 {

    //max owners/admins
    uint internal ownersCount;

    // owners/admins/manages
    mapping(address => bool) internal owners;

    modifier onlyOwner() {
        require(owners[msg.sender], "Caller is not the owner");
        _;
    }

    constructor(string memory _name, 
                string memory _symbol, 
                uint _totalSupply, 
                uint _decimals
               ) 
    ERC20(_name, _symbol) 
    {  
        // set deployer as one of owners
        owners[msg.sender] = true;
        // initial token supply to owner
        _mint(msg.sender, _totalSupply * 10**uint256(_decimals));
    }    

    /// @notice Set a new owner 
    /// @param _address address to be added to group of owners
    function setOwner(address _address) onlyOwner() external {
        require(ownersCount < 3); // only up to max 3 owners/admins/managers
        ownersCount++;
        owners[_address] = true;
    }

    /// @notice Check if address is one of owners/admins/managers
    /// @return _is true if owner false otherwise
    function isOwner(address _address) external view returns(bool _is) {
        return owners[_address];
    }
    
    /// @notice Mint an amount of tokens to an address if only owner/manager/admin
    /// @param _to address that will tokens
    /// @param _amount amount of tokens to send to receiving address
    function mint(address _to, uint _amount)  external {
        _mint(_to, _amount);
    }

}