// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC5484ConsensuallyApprovable.sol";
import "./ERC5484ConsensuallyTransferable.sol";

abstract contract ERC5484ConsensuallyApprovableAndTransferable is ERC5484ConsensuallyApprovable, ERC5484ConsensuallyTransferable {


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
    function _mint(address to, uint256 tokenId, BurnAuth tokenBurnAuth, ApproveAuth tokenApproveAuth, TransferAuth tokenTransferAuth) internal virtual onlyOwner {
        require(to != address(0), "ERC5484: mint to the zero address");
        require(!_exists(tokenId), "ERC5484: token already minted");

        transferAuths[tokenId] = tokenTransferAuth;
        approveAuths[tokenId] = tokenApproveAuth;
        super._mint(to, tokenId, tokenBurnAuth);
    }

        /**
     * @dev Transfer is forbidden for ERC 5484 tokens.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC5484, ERC5484ConsensuallyTransferable)  virtual {
        ERC5484ConsensuallyTransferable._transfer(from, to, tokenId);
    }

    /**
     * @dev Approve is forbidden for ERC 5484 tokens.
     */
    function _approve(
        address to,
        uint256 tokenId
    ) internal override(ERC5484, ERC5484ConsensuallyApprovable) virtual {
        ERC5484ConsensuallyApprovable._approve(to, tokenId);
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
        TransferAuth tokenTransferAuth,
        bytes memory data
    ) internal virtual {
        _mint(to, tokenId, tokenBurnAuth, tokenApproveAuth, tokenTransferAuth);
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
    function _safeMint(address to, uint256 tokenId, BurnAuth tokenBurnAuth, ApproveAuth tokenApproveAuth, TransferAuth tokenTransferAuth) internal virtual {
        _safeMint(to, tokenId, tokenBurnAuth, tokenApproveAuth, tokenTransferAuth, "");
    }

}