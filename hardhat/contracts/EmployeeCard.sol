// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Import of ERC5484 token standard.
import "./token/ERC5484/ERC5484.sol";

// Import of ERC5484 consensually approveable and transferable extension.
import "./token/ERC5484/extensions/ERC5484ConsensuallyApprovableAndTransferable.sol";

// Import of Strings standard
import "@openzeppelin/contracts/utils/Strings.sol";

// Import of Counter util.
import "@openzeppelin/contracts/utils/Counters.sol";

contract EmployeeCard is ERC5484ConsensuallyApprovableAndTransferable {

  using Counters for Counters.Counter;

/**
 * Counter for tokenId.
 */
  Counters.Counter private _counter;

  /**
   * On chain card data structure.
   */
  struct CardData {
    string tokenURI;
    uint256 startDate;
  }

  // Map of cards tokenIds by address of employees.
  mapping(address => uint256)  private _cards;

  // Map of card data by tokenId.
  mapping(uint256 => CardData) private _cardsData;

  // Event when tokens are sent.
  event TokenReceived(address sender, uint256 amount);
  event CallReceived(address sender, uint256 amount, bytes data);
  event EmployeeCardMinted(address employee, uint256 tokenId);
  event VacationRightsCalculated(address employee);

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}
    
  /**
   * Gets the URI of the token metadata. Using IPFS URI is highly recommended.
   */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "EmployeeCard: token does not exist");
    return string(_cardsData[tokenId].tokenURI);
  }

  /**
   * Mint a new employee card SBT token.
   * 
   * @param _recipient Recipient address
   * @param _tokenURI The token URI
   * @param _startDate Employee start date 
   * 
   */
  function mint(address _recipient, string calldata _tokenURI, uint256 _startDate) public onlyOwner {
    require(balanceOf(_recipient) == 0, "An employee can only have 1 token");

    uint256 tokenId = _counter.current();
    _safeMint(_recipient, tokenId, BurnAuth.IssuerOnly, ApproveAuth.IssuerOnly, TransferAuth.IssuerOnly);

    require(_exists(tokenId), "ERC721: invalid token ID");
    _counter.increment();

    _cards[_recipient] = tokenId; 
    _cardsData[tokenId] = CardData(_tokenURI, _startDate);
    _approve(owner(), tokenId);
    
    emit EmployeeCardMinted(_recipient, tokenId);
  }

  /**
   * Gets the employee card id.
   * 
   * @param employee Employee address.
   */
  function getEmployeeCardId(address employee) public view returns (uint256) {
    _requireMinted(_cards[employee]);

    return _cards[employee];
  }

  /**
   * Calculate total amount of days the employee can expect according to its time in the company.
   * 
   * @param employee Employee address.
   */
   function getEmployeeVacationRights(address employee) public view returns (uint256) {
    _requireMinted(_cards[employee]);

    uint256 _tokenId = _cards[employee];

    uint256 nbOfFullYears = (block.timestamp - _cardsData[_tokenId].startDate) / 31536000;
    uint256 nbAdditionalDays = nbOfFullYears/5;

    uint256 vacationRights = 25 + nbAdditionalDays;

    return vacationRights;
  }

/**
 * Allows the owner to transfer the card.
 * 
 * @param _tokenId Id of the card to transfer.
 * @param _newEmployeeAddress New address of the employee.
 */
  function transferCard(uint256 _tokenId, address _newEmployeeAddress) external {
    _requireMinted(_tokenId);

    address previousOwner = ownerOf(_tokenId);
    safeTransferFrom(previousOwner, _newEmployeeAddress, _tokenId);
  }

  /**
   * Allows the owner to burn the card.
   * 
   * @param _holder Current holder of the card.
   */
  function burnCard(address _holder) external {
    uint256 tokenId = _cards[_holder];
    _requireMinted(tokenId);

    _burn(tokenId);
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
