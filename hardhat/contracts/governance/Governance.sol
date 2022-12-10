// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./SWID.sol";
import "../identity/EmployeeCard.sol";

/// @title Governance contract for WorkID.
/// @notice Use this contract for governance with WorkID SBT and SWID tokens.
/// @dev This contract depends on both SWID ERC20 token and WorkID ERC721 SBT token.
contract Governance is Ownable {

    /// @notice Proposal structure contained the description and votes received.
    struct Proposal {
        string description;
        uint voteCountYes;
        uint voteCountNo;
    }
    
    /// @notice Voter structure that store each voter participation.
    struct Voter {
        address voter;
        uint256 amountSwid;
        bool hasVoted;
    }

    /// @notice Voting session structure to store a voting session details.
    struct ProposalVotingSession {
        Proposal proposal;
        uint256 startTime;
        uint256 endTime;
    }

    /// @notice Enum with the possible status for a voting session.
    enum  VotingSessionStatus {
        Pending,
        InProgress,
        Ended
    }

    ProposalVotingSession[] votingSessions;
    mapping (uint256 => mapping(address => Voter)) votingSessionsVoters;

    SWID immutable stackingContract;
    EmployeeCard immutable employeeCardContract;

    event ProposalSessionRegistered(uint sessionId);
    event Voted (address voter, uint sessionId, bool vote, uint voices);
    event VotingSessionReinitialized (uint256 sessionId);

    /// @notice Instanciate a Voting contract passing the addresses of both SWID and SBT contracts.
    /// @dev SBT contract is used to control that the user has a valid employee status, the SWID contract is used to check how many ERC20 tokens he has staked.
    /// @param widContractAddress The WID contract address.
    /// @param sbtContractAddress The SBT contract address.
    constructor(address widContractAddress, address payable sbtContractAddress) {
        stackingContract = new SWID(widContractAddress);
        employeeCardContract = EmployeeCard(sbtContractAddress);
    }
    
    /// @dev Modifier that check the user is an employee.
    modifier onlyEmployee() {
        uint256 employeeTokenId = employeeCardContract.getEmployeeCardId(msg.sender);
        require(employeeCardContract.isTokenValid(employeeTokenId), "Your employee card must still be valid to participate to the governance");
        _;
    }
    /// @dev Modifier that controls the governance eligibility of a user.
    modifier onlyVoters() {
        require(stackingContract.balanceOf(msg.sender) > 0, "WorkID Governance: You don't have any voting power.");
        _;
    }

    // ============== STACKING ==============

    /// @notice Returns the stacking contract address.
    /// @return The stacking contract address.
    function getStackingContractAddress() onlyEmployee external view returns (address){
        return address(stackingContract);
    }

    /// @notice Stacking proxy function to stacking contract with control the user is a valid employee.
    /// @param _duration The stacking duration.
    function stackWID(uint256 _duration, uint256 _amount) onlyEmployee external {
        stackingContract.stackWID(_duration, msg.sender, _amount);
    }

    /// @notice Unstacking proxy function to stacking contract with control the user is a valid employee.
    /// @param _depositId The deposit id to unstack.
    function unstackWID(uint256 _depositId) onlyEmployee external {
        stackingContract.unstackWID(_depositId, msg.sender);
    }
    
    /// @notice Gets a proposal session details.
    /// @param _sessionId The voting session id.
    /// @return The proposal voting session details for the given _sessionId
    function getOneProposalSession(uint256 _sessionId) external onlyEmployee onlyVoters view returns (ProposalVotingSession memory) {
        return votingSessions[_sessionId];
    }

    // =============  Voting ====================

    /// @notice Returns the voting power of the caller.
    /// @dev The voting power is represented by the amount of SWID the user has.
    /// @return The number of SWID the caller can use.
    function getVotingPower() external view onlyEmployee onlyVoters returns (uint256) {
        return stackingContract.balanceOf(msg.sender);
    }
    
    /// @notice Allows to add a proposal voting session.
    /// @dev The proposer define himself the period of the vote
    /// @param _desc Proposal description.
    /// @param _startDate Voting session start date.
    /// @param _endDate Voting session end date.
     function addProposal(string calldata _desc, uint256 _startDate, uint256 _endDate) external onlyEmployee onlyVoters {
        require(_startDate > block.timestamp, "Your proposal can't be in the past");
        require(_startDate < _endDate, "Your proposal end date can't be before the start date");
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), "Your proposal can't be empty");

        Proposal memory proposal;
        proposal.description = _desc;
        
        ProposalVotingSession memory proposalSession;
        proposalSession.proposal = proposal;
        proposalSession.startTime = _startDate;
        proposalSession.endTime = _endDate;

        votingSessions.push(proposalSession);
        emit ProposalSessionRegistered(votingSessions.length-1);
    }

    /// @notice Gets the voting session status according to the current timestamp.
    /// @param _votingSessionId The voting session number.
    /// @return The voting session status.
    function getVotingSessionStatus(uint256 _votingSessionId) external view onlyEmployee onlyVoters returns (VotingSessionStatus) {
        require(votingSessions[_votingSessionId].startTime > 0, "Voting session doesn't exist");

        if (votingSessions[_votingSessionId].startTime > block.timestamp) {
            return VotingSessionStatus.Pending;
        }
        else if (votingSessions[_votingSessionId].endTime < block.timestamp) {
            return VotingSessionStatus.Ended;
        }

        return VotingSessionStatus.InProgress;
    }

    /// @notice Returns whether the user has voted on the voting session.
    /// @param votingSessionId The voting session identifier.
    /// @return True if msg.sender has already voted on this session id.
    function getVoterStatus(uint256 votingSessionId) external onlyEmployee onlyVoters view returns(bool) {
        return votingSessionsVoters[votingSessionId][msg.sender].hasVoted;
    }

    /// @notice Allows to vote, either yes or no, on a proposal voting sesion.
    /// @dev The vote is only possible if the current block timestamp is between startTime dans endTime of the session.
    /// Only valid voters (valid SBT holder with staked SWID tokens) can vote.
    ///
    /// @param _sessionId The voting session on which the voter want to vote.
    /// @param _vote The vote chosen by the voter.
    /// @param _votingPower The amount of SWID the voter want to use for this voting session.
    function voteOnProposal(uint256 _sessionId, bool _vote, uint256 _votingPower) external onlyEmployee onlyVoters {
        require(votingSessions[_sessionId].startTime > 0, "Voting session doesn't exist");
        require(votingSessions[_sessionId].startTime < block.timestamp, "Voting session isn't open yet");
        require(votingSessionsVoters[_sessionId][msg.sender].hasVoted == false, 'You have already voted');
        require(stackingContract.balanceOf(msg.sender) >= _votingPower, "You don't have enough SWIDs for the chosen amount of voices");

        _vote ? votingSessions[_sessionId].proposal.voteCountYes+=_votingPower : votingSessions[_sessionId].proposal.voteCountNo+=_votingPower;
        votingSessionsVoters[_sessionId][msg.sender] = Voter(msg.sender, _votingPower, true);

        emit Voted(msg.sender, _sessionId, _vote, _votingPower);
    }
}
