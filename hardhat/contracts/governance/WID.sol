// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Import of ERC20 standard
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Import of Ownable.
import "@openzeppelin/contracts/access/Ownable.sol";

contract WID is ERC20, Ownable {
    constructor() ERC20("WorkID Token", "WID") {}

    function mint(address recipient, uint256 amount) external onlyOwner {
        _mint(recipient, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}