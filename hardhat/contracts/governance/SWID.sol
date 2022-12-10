// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Import of ERC20 standard
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Import of Ownable.
import "@openzeppelin/contracts/access/Ownable.sol";

import "./WID.sol";

import "../identity/EmployeeCard.sol";

/// @title Stacking ERC20 token used for WorkID.
/// @dev This contract can only be used by Governance contract.
/// @notice Any WorkID valid SBT holder can stack WID tokens to get governance voting powers.
contract SWID is ERC20, Ownable {

    /// @notice Store desposit informations.
    /// @dev StackTime and duration will be used for withdraw amount available calculation.
    struct WidDeposit {
        uint256 duration;
        uint256 stackTime;
        uint256 amountWID;
        uint256 amountSWID;
    }

    WID private immutable _widContract;
    mapping (address => mapping(uint256 => WidDeposit)) private _deposits;
    uint256 private _totalDeposits;

    event WIDStacked(uint256 depositId, address from, uint256 amountWID, uint256 duration, uint256 stackTime);
    event SWIDMinted(address to, uint256 amount);
    event DepositUnstacked(address from, uint256 depositId);
    event SWIDBurnt(uint256 amount);

    /// @notice ERC20 token for WID staking (symbol: sWID)
    /// @param _widContractAddress WID contract address.
    constructor(
        address _widContractAddress
    ) ERC20("Stacked WID", "SWID") {
        _widContract = WID(_widContractAddress);
    }

    /// @notice Receives
    /// @dev The amount of sWID minted depends of the staking duration.
    /// @param duration Stacking duration in months (must be 6, 12, 36 or 60).
    /// @param stacker The stacker address.
    /// @param amount Amount of WID to stack.
    function stackWID(uint256 duration, address stacker, uint256 amount) public onlyOwner {
        require(amount > 0, "SWID: You must send a positive amount of WID");
        require(duration == 15768000 || duration == 31536000 || duration == 94608000 || duration == 157680000, "SWID: Duration must be either 6 months, 1 year, 3 years or 5 years");

        uint256 amountSWID;
        // 6 months
        if (duration == 15768000) {
            amountSWID = (amount / 100) * 10;
        }
        // 1 year
        else if (duration == 31536000) {
            amountSWID = (amount / 100) * 20;
        }
        // 3 years
        else if (duration == 94608000) {
            amountSWID = (amount / 100) * 60;
        }
        // 5 years
        else if (duration == 157680000) {
            amountSWID = amount;
        }

        // Save the deposit.
        uint256 stackTime = block.timestamp;
        uint256 depositId = _totalDeposits++;
        _deposits[stacker][depositId] = WidDeposit(duration, stackTime, amount, amountSWID);

        // Transfers the amount stacked to this contract.
        _widContract.transferFrom(stacker, address(this), amount);

        // Mints new sWID depending of the amount of WID payed and the duration choosen
        _mint(stacker, amountSWID);

        emit WIDStacked(depositId, stacker, amount, duration, stackTime);
        emit SWIDMinted(stacker, amountSWID);
    }

    /// @notice Allows to unstack a specific deposit.
    /// @dev dApps will get the list of deposits through the WIDStack events.
    /// @param depositId The deposit to unstack
    /// @param stacker The stacker asking to unstack.
    function unstackWID(uint256 depositId, address stacker) public onlyOwner {
        require(_deposits[stacker][depositId].duration > 0, "SWID: The specified deposit doesn't exist.");
        require(_deposits[stacker][depositId].stackTime + _deposits[stacker][depositId].duration <= block.timestamp, "SWID: You can't unstack before stacking duration is fullfilled.");
        
        uint256 unstackAmount = _deposits[stacker][depositId].amountWID;
        uint256 burnAmount = _deposits[stacker][depositId].amountSWID;
        delete _deposits[stacker][depositId];
        
        // Transfer back the stacked WID.
        _widContract.transfer(stacker, unstackAmount);

         // Burn the corresponding SWID tokens.
        _burn(stacker, burnAmount);

        emit DepositUnstacked(stacker, unstackAmount);
        emit SWIDBurnt(burnAmount);
    }
}