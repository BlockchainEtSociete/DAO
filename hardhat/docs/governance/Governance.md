# Governance



> Governance contract for WorkID.

Use this contract for governance with WorkID SBT and SWID tokens.

*This contract depends on both SWID ERC20 token and WorkID ERC721 SBT token.*

## Methods

### addProposal

```solidity
function addProposal(string _desc, uint256 _startDate, uint256 _endDate) external nonpayable
```

Allows to add a proposal voting session.

*The proposer define himself the period of the vote*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _desc | string | Proposal description. |
| _startDate | uint256 | Voting session start date. |
| _endDate | uint256 | Voting session end date. |

### getOneProposalSession

```solidity
function getOneProposalSession(uint256 _sessionId) external view returns (struct Governance.ProposalVotingSession)
```

Gets a proposal session details.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _sessionId | uint256 | The voting session id. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | Governance.ProposalVotingSession | The proposal voting session details for the given _sessionId |

### getStackingContractAddress

```solidity
function getStackingContractAddress() external view returns (address)
```

Returns the stacking contract address.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The stacking contract address. |

### getVoterStatus

```solidity
function getVoterStatus(uint256 votingSessionId) external view returns (bool)
```

Returns whether the user has voted on the voting session.



#### Parameters

| Name | Type | Description |
|---|---|---|
| votingSessionId | uint256 | The voting session identifier. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | True if msg.sender has already voted on this session id. |

### getVotingPower

```solidity
function getVotingPower() external view returns (uint256)
```

Returns the voting power of the caller.

*The voting power is represented by the amount of SWID the user has.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The number of SWID the caller can use. |

### getVotingSessionStatus

```solidity
function getVotingSessionStatus(uint256 _votingSessionId) external view returns (enum Governance.VotingSessionStatus)
```

Gets the voting session status according to the current timestamp.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _votingSessionId | uint256 | The voting session number. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | enum Governance.VotingSessionStatus | The voting session status. |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### stackWID

```solidity
function stackWID(uint256 _duration, uint256 _amount) external nonpayable
```

Stacking proxy function to stacking contract with control the user is a valid employee.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _duration | uint256 | The stacking duration. |
| _amount | uint256 | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### unstackWID

```solidity
function unstackWID(uint256 _depositId) external nonpayable
```

Unstacking proxy function to stacking contract with control the user is a valid employee.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _depositId | uint256 | The deposit id to unstack. |

### voteOnProposal

```solidity
function voteOnProposal(uint256 _sessionId, bool _vote, uint256 _votingPower) external nonpayable
```

Allows to vote, either yes or no, on a proposal voting sesion.

*The vote is only possible if the current block timestamp is between startTime dans endTime of the session. Only valid voters (valid SBT holder with staked SWID tokens) can vote.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _sessionId | uint256 | The voting session on which the voter want to vote. |
| _vote | bool | The vote chosen by the voter. |
| _votingPower | uint256 | The amount of SWID the voter want to use for this voting session. |



## Events

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### ProposalSessionRegistered

```solidity
event ProposalSessionRegistered(uint256 sessionId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sessionId  | uint256 | undefined |

### Voted

```solidity
event Voted(address voter, uint256 sessionId, bool vote, uint256 voices)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| voter  | address | undefined |
| sessionId  | uint256 | undefined |
| vote  | bool | undefined |
| voices  | uint256 | undefined |

### VotingSessionReinitialized

```solidity
event VotingSessionReinitialized(uint256 sessionId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sessionId  | uint256 | undefined |



