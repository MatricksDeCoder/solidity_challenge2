// SPDX-License-Identifier: MIT

pragma solidity ^0.7.3;
import './Token.sol';

// Library SafeMath used to prevent overflows and underflows 
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Contribution {

    using SafeMath for uint256;

    // name of contract
    string public name;
    
    //address of token for contributions
    Token public token;

    // address token admin
    address public tokenAdmin;

    //address token price/rate (e.g 1ETH = 1 Token)
    // can be extended to be value or price Token from Oracle
    // for simplicity is set to 1
    uint public price = 1; 

    // contributors and the ETH amounts contributed
    mapping(address => uint) contributions;

    // event when Contribution made
    event Contributed(address indexed contributor, uint indexed etherAmount, uint tokenAmountReceived);

    constructor(address _token, string memory _name, address _tokenAdmin) {
        token = Token(_token);
        name = _name;
        tokenAdmin = _tokenAdmin;
    }

    // fallback functions when someone send Ether to contract not via contribute()
    // prevent accounts directly transferring ether

    // Function to receive Ether. when msg.data empty
    receive() external payable {
        revert();
    }

    // Fallback function called when msg.data is not empty
    fallback() external payable {
        revert();
    }

    /**
     * @notice contribute amount of Ether in return for Token only during (Window Period Open)
     */
    function contribute() external payable {
        _contribute();
    }

    /**
     * @notice Internal contribute function to give amount of Ether in return for Token only during (Window Period Open)
     */
    function _contribute() internal {
    
        require(msg.value > 0, "Must send some Ether amount");
        require(token.isOpen(), 'Window period for transfers must be open');    
        uint _tokenAmount = (msg.value).mul(price);
        uint _remainingBalance = token.balanceOf(tokenAdmin);
        require(_remainingBalance >= _tokenAmount, "Tokens must still be available");
        require(token.transferFrom(tokenAdmin, msg.sender, _tokenAmount));
        contributions[msg.sender] = contributions[msg.sender].add(_tokenAmount);
        emit Contributed(msg.sender, msg.value, _tokenAmount);
    }

    function contributionBalanceOf(address _contributor) external view returns(uint) {
        require(_contributor != address(0));
        return (contributions[_contributor]);
    }


}