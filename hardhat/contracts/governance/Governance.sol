// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../identity/MemberCard.sol";

/// @title Governance contract for NGOs.
/// @notice Use this contract for governance with MemberCard SBT tokens.
/// @dev This contract depends on MemberCard ERC721 SBT token.
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

    MemberCard immutable memberCardContract;

    event ProposalSessionRegistered(uint sessionId);
    event Voted (address voter, uint sessionId, bool vote, uint voices);
    event VotingSessionReinitialized (uint256 sessionId);

    /// @notice Instanciate a Voting contract passing the address of SBT contract.
    /// @dev SBT contract is used to control that the user has a valid member status.
    /// @param sbtContractAddress The SBT contract address.
    constructor(address payable sbtContractAddress) {
        memberCardContract = MemberCard(sbtContractAddress);
    }
    
    /// @dev Modifier that check the user is an employee.
    modifier onlyMember() {
        uint256 memberTokenId = memberCardContract.getMemberCardId(msg.sender);
        require(memberCardContract.isTokenValid(memberTokenId), "Your member card must still be valid to participate to the governance");
        _;
    }

    // =============  Voting ====================
    
    /// @notice Gets a proposal session details.
    /// @param _sessionId The voting session id.
    /// @return The proposal voting session details for the given _sessionId
    function getOneProposalSession(uint256 _sessionId) external onlyMember view returns (ProposalVotingSession memory) {
        require(_sessionId < votingSessions.length, "Governance: Invalid voting session");
        return votingSessions[_sessionId];
    }
    
    /// @notice Allows to add a proposal voting session.
    /// @dev The proposer define himself the period of the vote
    /// @param _desc Proposal description.
    /// @param _startDate Voting session start date.
    /// @param _endDate Voting session end date.
     function addProposal(string calldata _desc, uint256 _startDate, uint256 _endDate) external onlyMember {
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
    function getVotingSessionStatus(uint256 _votingSessionId) external view onlyMember returns (VotingSessionStatus) {
        require(_votingSessionId < votingSessions.length, "Governance: Voting session doesn't exist");

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
    function getVoterStatus(uint256 votingSessionId) external onlyMember view returns(bool) {
        require(votingSessionId < votingSessions.length, "Governance: Voting session doesn't exist");

        return votingSessionsVoters[votingSessionId][msg.sender].hasVoted;
    }

    /// @notice Allows to vote, either yes or no, on a proposal voting sesion.
    /// @dev The vote is only possible if the current block timestamp is between startTime dans endTime of the session.
    /// Only valid voters (valid SBT holders) can vote.
    ///
    /// @param _sessionId The voting session on which the voter want to vote.
    /// @param _vote The vote chosen by the voter.
    function voteOnProposal(uint256 _sessionId, bool _vote) external onlyMember {
        require(_sessionId < votingSessions.length, "Voting session doesn't exist");
        require(votingSessions[_sessionId].startTime < block.timestamp, "Voting session isn't open yet");
        require(votingSessionsVoters[_sessionId][msg.sender].hasVoted == false, 'You have already voted');

        _vote ? votingSessions[_sessionId].proposal.voteCountYes++ : votingSessions[_sessionId].proposal.voteCountNo++;
        votingSessionsVoters[_sessionId][msg.sender] = Voter(msg.sender, true);

        emit Voted(msg.sender, _sessionId, _vote, 1);
    }
}
