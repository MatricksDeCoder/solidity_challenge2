// SPDX-License-Identifier: MIT

pragma solidity ^0.7.3;
import './Token.sol';

// Library SafeMath used to prevent overflows and underflows 
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Contribution {

    using SafeMath for uint256;
    
    //address of token for contributions
    Token token;

    //address token price/rate (e.g 1ETH = 1 Token)
    // can be extended to be value or price Token from Oracle
    // for simplicity is set to 1
    uint price = 1; 

    // contributors and the ETH amounts contributed
    mapping(address => uint) contributions;

    // event when Contribution made
    event Contribution(address indexed contributor, uint etherAmount, uint tokenAmountReceived);

    constructor(address _token, uint _rate) {
        token = Token(_token);
    }

    // fallback functions when someone send Ether to contract not via contribute()

    // Function to receive Ether. when msg.data empty
    receive() external payable {

    }

    // Fallback function called when msg.data is not empty
    fallback() external payable {
        _contribute();
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
        require(msg.value > 0);
        require(token.isOpen(), 'Window period for transfers must be open');    
        uint _tokenAmount = msg.value * price;
        require(token.balanceOf(token.admin()) >= _tokenAmount, "Tokens must still be available");
        require(token.transferFrom(token.admin(), msg.sender, _tokenAmount));
        contributions[msg.sender] = contributions[msg.sender].add(_tokenAmount);
        emit Contribution(msg.sender, msg.value, _tokenAmount);
    }

    function contributionBalanceOf(address _contributor) external view returns(uint) {
        require(_contributor != address(0));
        return (contributions[_contributor]);
    }


}