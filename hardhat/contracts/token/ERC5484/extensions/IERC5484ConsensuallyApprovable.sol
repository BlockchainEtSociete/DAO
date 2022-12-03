// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../IERC5484.sol";

/**
 * @dev Extension of the EIP-5484 standard to allow approve on specific authorized scenarios.
 */
interface IERC5484ConsensuallyApprovable is IERC5484 {
    /// A guideline to standardlize approve-authorization's number coding
    enum ApproveAuth {
        IssuerOnly,
        OwnerOnly,
        Both,
        Neither
    }

    /// @notice provides approve authorization of the token id.
    /// @dev unassigned tokenIds are invalid, and queries do throw
    /// @param tokenId The identifier for a token.
    function approveAuth(uint256 tokenId) external view returns (ApproveAuth);
}
