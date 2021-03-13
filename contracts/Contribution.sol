// SPDX-License-Identifier: MIT

pragma solidity ^0.7.3;

contract Contribution {

    string public name;
    constructor(string memory _name) {
        name = _name;
    }
}