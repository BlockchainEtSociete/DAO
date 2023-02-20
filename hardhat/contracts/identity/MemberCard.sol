// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Import of ERC5484 token standard.
import "./token/ERC5484/ERC5484.sol";

/// @title An SBT for professionnal decentralized identity and proof of experience.
/// @author Bertrand Presles
/// @notice You can use this contract to generate digital ids for your members that can also be used as proof of their work in your company
contract MemberCard is ERC5484 {

  /// @notice Mapping for token URIs
  mapping(uint256 => string) private _tokenURIs;

  /// @notice Mapping of token ids with end date.
  mapping(uint256 => uint256) private _tokenEndTimes;

  // Event when tokens are sent.
  event TokenReceived(address sender, uint256 amount);
  event CallReceived(address sender, uint256 amount, bytes data);
  event MemberCardMinted(address member, uint256 tokenId);
  event VacationRightsCalculated(address member);
  event MemberCardEnded(uint256 tokenId, uint256 endTime);

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

  /// @notice Mint a new member card Consensual SBT token.
  /// @param _recipient Recipient address.
  /// @param _tokenURI The token URI.
  /// emit MemberCardMinted event when card is minted.
  function mint(address _recipient, string calldata _tokenURI) external onlyOwner {
    require(balanceOf(_recipient) == 0, "An member can only have 1 token");

    uint256 tokenId = this.totalSupply() + 1; // Avoid using token id 0.
    _safeMint(_recipient, tokenId, BurnAuth.Both);

    require(_exists(tokenId), "MemberCard: token generation failed");
    _setTokenURI(tokenId, _tokenURI);

    emit MemberCardMinted(_recipient, tokenId);

    _approve(owner(), tokenId);
  }

  /// @notice Gets the member card id.
  /// @param member Member address.
  /// @return The member card id.
  function getMemberCardId(address member) public view returns (uint256) {
    require(0 < this.balanceOf(member), "MemberCard: This address doesn't have any member card.");

    uint256 memberTokenId = tokenOfOwnerByIndex(member, 0);
    _requireMinted(memberTokenId);

    return memberTokenId;
  }

  /// @notice Returns if the SBT is still valid.
  /// @dev A valid token is a token without end time set
  /// @return True is it's still valid, false otherwise.
  function isTokenValid(uint256 tokenId) public view returns (bool) {
    _requireMinted(tokenId);

    return _tokenEndTimes[tokenId] == 0 || _tokenEndTimes[tokenId] >= block.timestamp;
  }

  /// @notice Gets an member card SBT end time.
  /// @return End time in unix timestamp format. It returns 0 if the card doesn't have end time yet.
  function getMemberCardEndTime(uint256 tokenId) external view returns(uint256) {
     _requireMinted(tokenId);

     return _tokenEndTimes[tokenId];
  }

  /// @notice Invalidates an SBT token.
  /// @dev Saves the end date (in unix timestamp format) in _tokenEndTimes mapping.
  /// @param tokenId The token id to invalidate.
  function invalidateMemberCard(uint256 tokenId, uint256 endTime) external onlyOwner {
     _requireMinted(tokenId);
    require(endTime >= block.timestamp, "MemberCard: you must specify a end time in the future");
    _tokenEndTimes[tokenId] = endTime;

    emit MemberCardEnded(tokenId, endTime);
  }

  /// @notice Burns a card.
  /// @param member Current holder of the card.
  function burnCard(address member) external onlyOwner {
    uint256 memberTokenId = getMemberCardId(member);

    _burn(memberTokenId);

    // Clear metadata (if any)
    if (bytes(_tokenURIs[memberTokenId]).length != 0) {
        delete _tokenURIs[memberTokenId];
    }
  }
}
