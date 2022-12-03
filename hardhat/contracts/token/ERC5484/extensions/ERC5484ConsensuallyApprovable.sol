// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../ERC5484.sol";
import "./IERC5484ConsensuallyApprovable.sol";

abstract contract ERC5484ConsensuallyApprovable is ERC5484, IERC5484ConsensuallyApprovable {

    /**
     * @dev Mapping to store approve authorizations for each token issued.
     */
    mapping (uint256 => ApproveAuth) approveAuths;

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
    function _mint(address to, uint256 tokenId, BurnAuth tokenBurnAuth, ApproveAuth tokenApproveAuth) internal virtual onlyOwner {
        require(to != address(0), "ERC5484: mint to the zero address");
        require(!_exists(tokenId), "ERC5484: token already minted");

        approveAuths[tokenId] = tokenApproveAuth;
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
        ApproveAuth tokenApproveAuth,
        bytes memory data
    ) internal virtual {
        _mint(to, tokenId, tokenBurnAuth, tokenApproveAuth);
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
    function _safeMint(address to, uint256 tokenId, BurnAuth tokenBurnAuth, ApproveAuth tokenApproveAuth) internal virtual {
        _safeMint(to, tokenId, tokenBurnAuth, tokenApproveAuth, "");
    }

    /**
     * @dev Approve is forbidden for ERC 5484 tokens.
     */
    function _approve(
        address to,
        uint256 tokenId
    ) internal override(ERC5484) virtual {
        
        // Implements check on approve auths for approve allowance.
        if (approveAuths[tokenId] == ApproveAuth.Neither) {
            revert("ERC 5484: Approve is not allowed");
        }
        else if (approveAuths[tokenId] == ApproveAuth.IssuerOnly) {
            require(owner() ==  _msgSender(), "ERC 5484: Only the issuer of the token is allowed to approve.");
        }
        else if (approveAuths[tokenId] == ApproveAuth.OwnerOnly) {
            require(_ownerOf(tokenId) ==  _msgSender(), "ERC 5484: Only the owner of the token is allowed to approve.");
        }
        else if (approveAuths[tokenId] == ApproveAuth.Both) {
            require(_ownerOf(tokenId) ==  _msgSender() || owner() ==  _msgSender(), "ERC 5484: Only the owner or the issuer of the token are allowed to approve.");
        }

        ERC721._approve(to, tokenId);
    }
    
    /**
     * @dev Gets the approve authorization information for this token.
     */
    function approveAuth(
        uint256 tokenId
    ) external view override returns (ApproveAuth) {
        require(_exists(tokenId), "EmployeeCard: token does not exist");

        return approveAuths[tokenId];
    }
}