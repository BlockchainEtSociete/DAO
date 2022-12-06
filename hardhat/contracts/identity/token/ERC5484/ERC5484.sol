// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// Import of ERC721Enumerable extension
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// Import of Ownable.
import "@openzeppelin/contracts/access/Ownable.sol";

import "./IERC5484.sol";

/**
 * @dev Implements EIP-5484: Consensual Soulboynd Tokens - https://eips.ethereum.org/EIPS/eip-5484
 */
contract ERC5484 is IERC5484, ERC721Enumerable, Ownable {

    /// @notice Mapping to store burn authorizations for each token issued.
    mapping (uint256 => BurnAuth) burnAuths;

    /// @notice Constructor of ERC5484.
    constructor (string memory name, string memory symbol) public ERC721(name, symbol) {}

    
     /// @dev Same as {xref-ERC5484-_safeMint-address-uint256-BurnAuth-}[`_safeMint`], with an additional `data` parameter which is
     /// forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
    function _safeMint(
        address to,
        uint256 tokenId,
        BurnAuth tokenBurnAuth,
        bytes memory data
    ) internal virtual {
        burnAuths[tokenId] = tokenBurnAuth;
        ERC721._safeMint(to, tokenId, data);

        emit Issued(_msgSender(), to, tokenId, tokenBurnAuth);
    }

    /**
     * @dev Safely mints `tokenId` and transfers it to `to`.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     * Emits a {Issued} event.
     */
    function _safeMint(address to, uint256 tokenId, BurnAuth tokenBurnAuth) internal virtual {
        _safeMint(to, tokenId, tokenBurnAuth, "");
    }

    /**
     * @dev Transfer is forbidden for ERC 5484 tokens by default.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override virtual {
        revert("ERC 5484: Transfer is not allowed");
    }

  /**
   * @dev Ensure that burn is only accepted for contract owner. 
   * 
   * Requirements:
   * 
   * - `msg.sender` should be the one defined by the burn auth rule.
   * - `tokenId` must exists
   * 
   * @param tokenId The token id to burn.
   */
    function _burn(uint256 tokenId) internal virtual override {
        // Implements check on burn auths for burn allowance.
        if (burnAuths[tokenId] == BurnAuth.Neither) {
            revert("ERC 5484: Burn is not allowed");
        }
        else if (burnAuths[tokenId] == BurnAuth.IssuerOnly) {
            require(owner() ==  _msgSender(), "ERC 5484: Only the issuer of the token is allowed to burn.");
        }
        else if (burnAuths[tokenId] == BurnAuth.OwnerOnly) {
            require(_ownerOf(tokenId) ==  _msgSender(), "ERC 5484: Only the owner of the token is allowed to burn.");
        }
        else if (burnAuths[tokenId] == BurnAuth.Both) {
            require(_ownerOf(tokenId) ==  _msgSender() || owner() ==  _msgSender(), "ERC 5484: Only the owner or the issuer of the token are allowed to burn.");
        }

        ERC721._burn(tokenId);
    }

    /**
     * @dev Gets the burn authorization information for this token.
     */
    function burnAuth(
        uint256 tokenId
    ) external view returns (BurnAuth) {
        require(_exists(tokenId), "EmployeeCard: token does not exist");

        return burnAuths[tokenId];
    }
}