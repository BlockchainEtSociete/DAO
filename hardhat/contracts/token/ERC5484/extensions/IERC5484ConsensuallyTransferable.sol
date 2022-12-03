// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../IERC5484.sol";

/**
 * @dev Extension of the EIP-5484 standard to allow transfer on specific authorized scenarios.
 */
interface IERC5484ConsensuallyTransferable is IERC5484 {
    /// A guideline to standardlize transfer-authorization's number coding
    enum TransferAuth {
        IssuerOnly,
        OwnerOnly,
        Both,
        Neither
    }

    /// @notice provides transfer authorization of the token id.
    /// @dev unassigned tokenIds are invalid, and queries do throw
    /// @param tokenId The identifier for a token.
    function transferAuth(uint256 tokenId) external view returns (TransferAuth);
}
