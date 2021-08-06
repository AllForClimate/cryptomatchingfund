// contracts/CustomCoin.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomCoin is ERC20 {
    address owner;

    constructor() ERC20("Coin", "COIN") {
        owner = msg.sender;
    }

    function mint(address _recipient, uint256 _amount) public {
        require(msg.sender == owner);
        _mint(_recipient, _amount);
    }
}
