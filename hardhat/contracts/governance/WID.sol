// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Import of ERC20 standard
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Import of Ownable.
import "@openzeppelin/contracts/access/Ownable.sol";

contract WID is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function increaseTotalSupply(uint256 amount) external onlyOwner {
        _mint(msg.sender, amount);
    }

    function decreaseTotalSupply(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
    }
}