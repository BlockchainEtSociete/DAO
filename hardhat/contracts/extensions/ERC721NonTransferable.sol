// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

// Import of ERC721 standard
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// Import of Ownable standard
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ERC721NonTransferable is Ownable, ERC721Enumerable {

  /**
   * Ensure transfer is only accepted if initiated for contract creator.
   */
  function _transfer(
      address from,
      address to,
      uint256 tokenId
  ) internal override onlyOwner {
    super._transfer(from, to, tokenId);
  }
  
  /**
   * Ensure that approvals are only allowed for contract owner.
   */
  function _approve(address to, uint256 tokenId) internal virtual override onlyOwner {
      super._approve(to, tokenId);
  }

  /**
   * Ensure that burn is only accepted for contract owner. 
   */
    function _burn(uint256 tokenId) internal virtual override onlyOwner {
        super._burn(tokenId);
    }
}
