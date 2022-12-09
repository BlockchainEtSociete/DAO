// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Import of ERC5484 token standard.
import "./token/ERC5484/ERC5484.sol";

/// @title An SBT for professionnal decentralized identity and proof of experience.
/// @author Bertrand Presles
/// @notice You can use this contract to generate digital ids for your employees that can also be used as proof of their work in your company
contract EmployeeCard is ERC5484 {

  /// @notice Mapping for token URIs
  mapping(uint256 => string) private _tokenURIs;

  /// @notice Mapping of token ids with end date.
  mapping(uint256 => uint256) private _tokenEndTimes;

  // Event when tokens are sent.
  event TokenReceived(address sender, uint256 amount);
  event CallReceived(address sender, uint256 amount, bytes data);
  event EmployeeCardMinted(address employee, uint256 tokenId);
  event VacationRightsCalculated(address employee);
  event EmployeeCardEnded(uint256 tokenId, uint256 endTime);

  constructor(string memory name, string memory symbol) ERC5484(name, symbol) {}

  /// @notice Gets the token URI for the passed token id.
  /// @dev Returns an URI for a given token ID. Revert if the token ID does not exist. May return an empty string.
  /// @param tokenId uint256 ID of the token to query
  /// @return The token URI 
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
      require(_exists(tokenId));
      return _tokenURIs[tokenId];
  }

  /// @notice Sets a token URI for a given token id.
  /// @dev Internal function to set the token URI for a given token. Reverts if the token ID does not exist
  /// @param tokenId uint256 ID of the token to set its URI
  /// @param uri string URI to assign
  function _setTokenURI(uint256 tokenId, string memory uri) internal {
      require(_exists(tokenId));
      _tokenURIs[tokenId] = uri;
  }

  /// @notice Mint a new employee card Consensual SBT token.
  /// @param _recipient Recipient address.
  /// @param _tokenURI The token URI.
  /// emit EmployeeCardMinted event when card is minted.
  function mint(address _recipient, string calldata _tokenURI) external onlyOwner {
    require(balanceOf(_recipient) == 0, "An employee can only have 1 token");

    uint256 tokenId = this.totalSupply();
    _safeMint(_recipient, tokenId, BurnAuth.Both);

    require(_exists(tokenId), "EmployeeCard: token generation failed");
    _setTokenURI(tokenId, _tokenURI);

    emit EmployeeCardMinted(_recipient, tokenId);

    _approve(owner(), tokenId);
  }

  /// @notice Gets the employee card id.
  /// @param employee Employee address.
  /// @return The employee card id.
  function getEmployeeCardId(address employee) public view returns (uint256) {
    uint256 employeeTokenId = tokenOfOwnerByIndex(employee, 0);
    _requireMinted(employeeTokenId);

    return employeeTokenId;
  }

  /// @notice Returns if the SBT is still valid.
  /// @dev A valid token is a token without end time set
  /// @return True is it's still valid, false otherwise.
  function isTokenValid(uint256 tokenId) public view returns (bool) {
    _requireMinted(tokenId);
    return _tokenEndTimes[tokenId] == 0;
  }

  /// @notice Invalidates an SBT token.abi
  /// @dev Saves the end date (in unix timestamp format) in _tokenEndTimes mapping.
  /// @param tokenId The token id to invalidate.
  function invalidateEmployeeCard(uint256 tokenId) external onlyOwner {
    uint256 endTime = block.timestamp;
    _tokenEndTimes[tokenId] = endTime;

    emit EmployeeCardEnded(tokenId, endTime);
  }

  /// @notice Burns a card.
  /// @param employee Current holder of the card.
  function burnCard(address employee) external onlyOwner {
    uint256 employeeTokenId = tokenOfOwnerByIndex(employee, 0);
    _requireMinted(employeeTokenId);

    _burn(employeeTokenId);

    // Clear metadata (if any)
    if (bytes(_tokenURIs[employeeTokenId]).length != 0) {
        delete _tokenURIs[employeeTokenId];
    }
  }

  /// @notice Receive function to allow to receive tokens.
  receive() external payable onlyOwner {
    emit TokenReceived(msg.sender, msg.value);
  }

  /// @notice Fallback function to track unknown received calls.
  fallback() external payable onlyOwner {
    emit CallReceived(msg.sender, msg.value, msg.data);
  }
}
