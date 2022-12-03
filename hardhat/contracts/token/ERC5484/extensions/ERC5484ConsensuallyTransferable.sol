// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../ERC5484.sol";
import "./IERC5484ConsensuallyTransferable.sol";

abstract contract ERC5484ConsensuallyTransferable is ERC5484, IERC5484ConsensuallyTransferable {

    /**
     * @dev Mapping to store transfer authorizations for each token issued.
     */
    mapping (uint256 => TransferAuth) transferAuths;

    /**
     * @notice Mints `tokenId` and transfers it to `to`.
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
    function _mint(address to, uint256 tokenId, BurnAuth tokenBurnAuth, TransferAuth tokenTransferAuth) internal virtual onlyOwner {
        require(to != address(0), "ERC5484: mint to the zero address");
        require(!_exists(tokenId), "ERC5484: token already minted");

        transferAuths[tokenId] = tokenTransferAuth;
        super._mint(to, tokenId, tokenBurnAuth);
    }

    /**
     * @dev Same as {xref-ERC5484-_safeMint-address-uint256-BurnAuth-}[`_safeMint`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeMint(
        address to,
        uint256 tokenId,
        BurnAuth tokenBurnAuth,
        TransferAuth tokenTransferAuth,
        bytes memory data
    ) internal virtual {
        _mint(to, tokenId, tokenBurnAuth, tokenTransferAuth);
        require(
            _checkOnERC5484Received(address(0), to, tokenId, data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    /**
     * @notice Safely mints `tokenId` and transfers it to `to`.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     * Emits a {Issued} event.
     */
    function _safeMint(address to, uint256 tokenId, BurnAuth tokenBurnAuth, TransferAuth tokenTransferAuth) internal virtual {
        _safeMint(to, tokenId, tokenBurnAuth, tokenTransferAuth, "");
    }

    /**
     * @dev Transfer is forbidden for ERC 5484 tokens.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC5484) virtual {
        
        // Implements check on transfer auths for transfer allowance.
        if (transferAuths[tokenId] == TransferAuth.Neither) {
            revert("ERC 5484: Transfer is not allowed");
        }
        else if (transferAuths[tokenId] == TransferAuth.IssuerOnly) {
            require(owner() ==  _msgSender(), "ERC 5484: Only the issuer of the token is allowed to transfer.");
        }
        else if (transferAuths[tokenId] == TransferAuth.OwnerOnly) {
            require(_ownerOf(tokenId) ==  _msgSender(), "ERC 5484: Only the owner of the token is allowed to transfer.");
        }
        else if (transferAuths[tokenId] == TransferAuth.Both) {
            require(_ownerOf(tokenId) ==  _msgSender() || owner() ==  _msgSender(), "ERC 5484: Only the owner or the issuer of the token are allowed to transfer.");
        }

        ERC721._transfer(from, to, tokenId);
    }

    /**
     * @dev Gets the transfer authorization information for this token.
     */
    function transferAuth(
        uint256 tokenId
    ) external view override returns (TransferAuth) {
        require(_exists(tokenId), "EmployeeCard: token does not exist");

        return transferAuths[tokenId];
    }
}