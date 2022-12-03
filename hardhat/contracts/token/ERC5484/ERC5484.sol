// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// Import of ERC721 standard
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Import of Ownable standard
import "@openzeppelin/contracts/access/Ownable.sol";

// Import address utils
import "@openzeppelin/contracts/utils/Address.sol";

import "./IERC5484.sol";

/**
 * @dev Implements EIP-5484: Consensual Soulboynd Tokens - https://eips.ethereum.org/EIPS/eip-5484
 */
abstract contract ERC5484 is IERC5484, ERC721, Ownable {
     using Address for address;

    /**
     * @dev Mapping to store burn authorizations for each token issued.
     */
    mapping (uint256 => BurnAuth) burnAuths;

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC5484Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal returns (bool) {
        if (to.isContract()) {
            try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("ERC5484: transfer to non ERC721Receiver implementer");
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     * Emits a {Issued} event.
     */
    function _mint(address to, uint256 tokenId, BurnAuth tokenBurnAuth) internal virtual onlyOwner {
        burnAuths[tokenId] = tokenBurnAuth;
        _mint(to, tokenId);

        emit Issued(_msgSender(), to, tokenId, tokenBurnAuth);
    }

    /**
     * @dev Same as {xref-ERC5484-_safeMint-address-uint256-BurnAuth-}[`_safeMint`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeMint(
        address to,
        uint256 tokenId,
        BurnAuth tokenBurnAuth,
        bytes memory data
    ) internal virtual {
        _mint(to, tokenId, tokenBurnAuth);
        require(
            _checkOnERC5484Received(address(0), to, tokenId, data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
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
        revert("Transfer is not authorized for ERC 5484 tokens");
    }

    /**
     * @dev Approve is forbidden for ERC 5484 tokens by default.
     */
    function _approve(
        address to,
        uint256 tokenId
    ) internal override virtual {
        revert("Approve is not authorized for ERC 5484 tokens");
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