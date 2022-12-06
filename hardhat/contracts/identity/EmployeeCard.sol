// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Import of ERC5484 token standard.
import "./token/ERC5484/ERC5484.sol";

contract EmployeeCard is ERC5484 {

  // Mapping for token URIs
  mapping(uint256 => string) private _tokenURIs;

  // Event when tokens are sent.
  event TokenReceived(address sender, uint256 amount);
  event CallReceived(address sender, uint256 amount, bytes data);
  event EmployeeCardMinted(address employee, uint256 tokenId);
  event VacationRightsCalculated(address employee);

  constructor(string memory name, string memory symbol) ERC5484(name, symbol) {}

  /**
    * @dev Returns an URI for a given token ID
    * Throws if the token ID does not exist. May return an empty string.
    * @param tokenId uint256 ID of the token to query
    */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
      require(_exists(tokenId));
      return _tokenURIs[tokenId];
  }

  /**
    * @dev Internal function to set the token URI for a given token
    * Reverts if the token ID does not exist
    * @param tokenId uint256 ID of the token to set its URI
    * @param uri string URI to assign
    */
  function _setTokenURI(uint256 tokenId, string memory uri) internal {
      require(_exists(tokenId));
      _tokenURIs[tokenId] = uri;
  }

  /**
   * Mint a new employee card Consensual SBT token.
   * 
   * @param recipient Recipient address
   * @param tokenURI The token URI
   * 
   */
  function mint(address recipient, string calldata tokenURI) public onlyOwner {
    require(balanceOf(recipient) == 0, "An employee can only have 1 token");

    uint256 tokenId = this.totalSupply();
    _safeMint(recipient, tokenId, BurnAuth.Both);

    require(_exists(tokenId), "EmployeeCard: token generation failed");
    _setTokenURI(tokenId, tokenURI);

    emit EmployeeCardMinted(recipient, tokenId);

    _approve(owner(), tokenId);
  }

  /**
   * Gets the employee card id.
   * 
   * @param employee Employee address.
   */
  function getEmployeeCardId(address employee) public view returns (uint256) {
    uint256 employeeTokenId = tokenOfOwnerByIndex(employee, 0);
    _requireMinted(employeeTokenId);

    return employeeTokenId;
  }

  /**
   * Burn a card.
   * 
   * @param employee Current holder of the card.
   */
  function burnCard(address employee) external onlyOwner {
    uint256 employeeTokenId = tokenOfOwnerByIndex(employee, 0);
    _requireMinted(employeeTokenId);

    _burn(employeeTokenId);

    // Clear metadata (if any)
    if (bytes(_tokenURIs[employeeTokenId]).length != 0) {
        delete _tokenURIs[employeeTokenId];
    }
  }

  /**
   * Only the owner should be able to add tokens to this contract.
   */
  receive() external payable onlyOwner {
    emit TokenReceived(msg.sender, msg.value);
  }

  fallback() external payable onlyOwner {
    emit CallReceived(msg.sender, msg.value, msg.data);
  }
}
