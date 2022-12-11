# WorkID [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents
- [WorkID ](#workid-)
  - [Table of Contents](#table-of-contents)
  - [Presentation](#presentation)
  - [Live demo](#live-demo)
    - [Public deployment](#public-deployment)
  - [Structure](#structure)
  - [Installation](#installation)
  - [Commands](#commands)
    - [Compile smart contrat](#compile-smart-contrat)
    - [Generate documentation](#generate-documentation)
    - [Run tests without coverage](#run-tests-without-coverage)
    - [Run tests with coverage](#run-tests-with-coverage)
    - [Deploy smart contrat](#deploy-smart-contrat)
    - [Start a local JSON-RPC node](#start-a-local-json-rpc-node)
  - [Front commands](#front-commands)
    - [Build](#build)
    - [Start the front app](#start-the-front-app)
  - [Smart contract Tests](#smart-contract-tests)
    - [Tests results](#tests-results)
    - [Gas consumption](#gas-consumption)
    - [Coverage](#coverage)

<a name="presentation"></a>
## Presentation
WorkID allows you to track and prove your work experience in the companies you're working in. It also gives you access to your company services using a secure SBT based authentication mechanism, and rights to participate at the company governance using WID and sWID tokens.

<a name="demo"></a>
## Live demo

### Public deployment
You can access a live version of this app on these URLs: 

- Any web browser: https://alyra-work-1z337qafg-bpresles.vercel.app/
- IPFS enabled web browser (like Brave): ipns://alyra-workid.presles.fr/

<a name="structure"></a>
## Structure
The project contains the following main folders:

```
front (Front UI)
|
+-- public (static files)
|
+-- src (React sources)

hardhat (Smart Contract)
|
+-- contracts (Solidity source file of the smart contract)
|
+-- deploy (Deployment script)
|
+-- test (Unit tests)
|
+-- coverage (Coverage of tests reports - created dynamically when running coverage)
```

<a name="installation"></a>
## Installation
To run the tests, you'll need to execute the following commands to install the required dependencies:

```bash
$ git clone https://github.com/bpresles/Alyra-WorkID.git
$ yarn install
```

Then copy the .env.dist file as .env:
```bash
cp .env.dist .env
```

Edit the .env file and set your mnemonic, infura id and alchemy id:
```bash
MNEMONIC="YOUR_MNEMONIC"
INFURA_ID="AN_INFURA_ID"
ALCHEMY_ID="AN_ALCHEMY_ID"
```

<a name="commands"></a>
## Commands

### Compile smart contrat
```bash
cd hardhat
yarn build
```

### Generate documentation
```bash
cd hardhat
yarn documentation
```

### Run tests without coverage
```bash
cd hardhat
yarn test
```

### Run tests with coverage
```bash
cd hardhat
yarn coverage
```
### Deploy smart contrat

**Local**
```bash
cd hardhat
yarn deploy:dev
```
**Goerli**
```bash
cd hardhat
yarn deploy:goerli
```

**Sepolia**
```bash
cd hardhat
yarn deploy:sepolia
```
**Mumbai**
```bash
cd hardhat
yarn deploy:mumbai
```

### Start a local JSON-RPC node
You can start a local JSON-RPC node to be able to interact with HardHat network using a JSON-RPC client like a wallet.
```bash
yarn dev
```

When using MetaMask, you should prefer to start Ganache (https://trufflesuite.com/ganache/).

## Front commands
The front app allows you to easily interact with voting contract and manage a complete vote.

### Build
To build the front app, use the following commands:
```bash
cd client
yarn build
```

### Start the front app
You can start it using these commands:
```bash
cd client
yarn start
```

<a name="tests-structure"></a>
## Smart contract Tests
The tests are covering most of the functions of the smart contracts :

- WorkID SBT contract
- WID ERC20 contract
- sWID ERC20 staking contract
- Voting contract

In each category, the tests are covering the following elements:

- Requirements
- Events
- Nominal scenarios
- Limit scenarios

<a name="tests-results"></a>
### Tests results 

```bash
TODO
```

<a href="gas-consumption"></a>
### Gas consumption

```bash
  EmployeeCard Test
    Deployment
      ✓ Should get contract address
    SBT Tests
      ✓ Require - Should revert on trying to transfer
    Mint
      ✓ Require - Should revert when already minted
      ✓ Require - Should revert when not called by contract issuer
      ✓ Event - Should mint a new EmployeeCard and emit EmployeeCardMinted event
      ✓ UseCase - Should have owner of contract approved on tokenId after mint
    Get employee card id
      ✓ Require - Should revert on token id invalid
      ✓ Usecase - Should return the tokenId when it exists
    tokenURI
      ✓ Require - Should revert when tokenId don't exist
      ✓ Usecase - Should return minted token uri
    isTokenValid
      ✓ Require - Should revert when called by other than owner
      ✓ Require - Should revert on token not minted
      ✓ Require - Should revert on end time in the past
      ✓ UseCase - Should return that token is valid when no end time is set
      ✓ UseCase - Should return that token is valid when card has end time in the future
      ✓ Event - Should event on invalidation
    Burn card
      ✓ Require - Should revert on no token for employee
      ✓ Require - Should revert on not owner msg.sender
      ✓ UseCase - Should burn token when called by issuer

  Governance Test
    Deployment
      ✓ Should get contract address
    addProposal
      ✓ Require - Should revert if called by other than an employee
      ✓ Require - Should revert if employee card has expired
      ✓ Require - Should revert if user is not eligible to governance (no sWID tokens)
      ✓ Require - Should revert when proposal start time is in the past
      ✓ Require - Should revert when proposal end time is before start time
      ✓ Require - Should revert when proposal description is empty
      ✓ UseCase - Should register proposal
    getOneProposalSession
      ✓ Require - Should revert if user is not eligible to governance (no sWID tokens)
      ✓ Require - Should revert if user is not employee
      ✓ Require - Revert if sessionId doesn't exists
      ✓ UseCase - Return proposal session information when it exists
    getVotingSessionStatus
      ✓ Require - Should revert if called by other than an employee
      ✓ Require - Should revert if user is not eligible to governance (no sWID tokens)
      ✓ Require - Should revert when voting session doesn't exist
      ✓ UseCase - Should return pending when start time is in the future
      ✓ UseCase - Should return in progress when start time is in the past and end time time in the future
      ✓ UseCase - Should return ended when end time is in the past
    getVotingPower
      ✓ Require - Should revert if not valid employee
      ✓ Require - Should revert if not voter
      ✓ UseCase - Should return amount of 0.1 * WID stacked for 6 months period in voting power
      ✓ UseCase - Should return amount of 0.2 * WID stacked for 1 year period in voting power
      ✓ UseCase - Should return amount of 0.6 * WID stacked for 3 years period in voting power
      ✓ UseCase - Should return amount of WID stacked for 5 years period in voting power
    voteOnProposal
      ✓ Require - Should revert if called by other than an employee
      ✓ Require - Should revert if user is not eligible to governance (no sWID tokens)
      ✓ Require - Should revert when voting session doesn't exist
      ✓ Require - Should revert when session hasn't started yet
      ✓ Require - Should revert when user has already voted
      ✓ Require - Should revert when user has not enough voting power
      ✓ UseCase - Should register vote Yes when user meets all the requirements.
      ✓ UseCase - Should register vote No when user meets all the requirements.
    getVoterStatus
      ✓ Require - Should revert if called by other than an employee
      ✓ Require - Should revert if user is not eligible to governance (no sWID tokens)
      ✓ Require - Should revert when voting session doesn't exist
      ✓ UseCase - Should return false if user hasn't voted yet
    getStackingContractAddress
      ✓ Require - Should revert if called by other than an employee
    stackWID
      ✓ Require - Should revert if called by other than an employee
    unstackWID
      ✓ Require - Should revert if called by other than an employee
      ✓ UseCase - Should unstack successfully after stacking period

  SWID Test
    Deployment
      ✓ Should get contract address
    stackWID
      ✓ Require - Should revert if called by other than the owner
      ✓ Require - Should revert on zero or negative amount
      ✓ Require - Should not accept duration other than 6 months, 1 year, 3 years or 5 years
      ✓ UseCase - Should accept stacking WID for 6 months and return 0.1*WID
      ✓ UseCase - Should accept stacking WID for 1 year and return 0.2*WID
      ✓ UseCase - Should accept stacking WID for 1 year and return 0.6*WID
      ✓ UseCase - Should accept stacking WID for 5 year and return 1*WID
    unstackWID
      ✓ Require - Should revert if called by other than the owner
      ✓ Require - Should revert on deposit doesn't exist
      ✓ Require - Should revert on trying to withdraw before stacking time
      ✓ UseCase - Should unstack successfully after stacking period

  SWID Test
    Deployment
      ✓ Should get contract address
    Mint
      ✓ Require - Should revert on called by other than owner
      ✓ UseCase - Should mint WID token when called by owner
    Burn
      ✓ Require - Should revert on called by other than owner
      ✓ UseCase - Should burn WID token when called by owner

·-------------------------------------------|----------------------------|-------------|-----------------------------·
|           Solc version: 0.8.17            ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 30000000 gas  │
············································|····························|·············|······························
|  Methods                                                                                                           │
·················|··························|··············|·············|·············|···············|··············
|  Contract      ·  Method                  ·  Min         ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
·················|··························|··············|·············|·············|···············|··············
|  EmployeeCard  ·  burnCard                ·           -  ·          -  ·      60870  ·            1  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  EmployeeCard  ·  invalidateEmployeeCard  ·           -  ·          -  ·      50402  ·            4  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  EmployeeCard  ·  mint                    ·           -  ·          -  ·     223302  ·           43  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  Governance    ·  addProposal             ·           -  ·          -  ·     142194  ·           12  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  Governance    ·  stackWID                ·      171286  ·     249239  ·     241582  ·           24  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  Governance    ·  unstackWID              ·           -  ·          -  ·      95398  ·            1  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  Governance    ·  voteOnProposal          ·      142987  ·     142989  ·     142988  ·            5  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  SWID          ·  stackWID                ·      219346  ·     219778  ·     219652  ·           10  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  SWID          ·  unstackWID              ·           -  ·          -  ·      75964  ·            3  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  WID           ·  approve                 ·           -  ·          -  ·      46911  ·           29  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  WID           ·  burn                    ·           -  ·          -  ·      29593  ·            2  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  WID           ·  mint                    ·           -  ·          -  ·      71235  ·           32  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  Deployments                              ·                                          ·  % of limit   ·             │
············································|··············|·············|·············|···············|··············
|  EmployeeCard                             ·           -  ·          -  ·    3775694  ·       12.6 %  ·          -  │
············································|··············|·············|·············|···············|··············
|  Governance                               ·           -  ·          -  ·    5184707  ·       17.3 %  ·          -  │
············································|··············|·············|·············|···············|··············
|  SWID                                     ·           -  ·          -  ·    2280549  ·        7.6 %  ·          -  │
············································|··············|·············|·············|···············|··············
|  WID                                      ·           -  ·          -  ·    1628060  ·        5.4 %  ·          -  │
·-------------------------------------------|--------------|-------------|-------------|---------------|-------------·

  76 passing (10s)
```

<a href="coverage"></a>
### Coverage

```bash
-------------------------|----------|----------|----------|----------|----------------|
File                     |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------------------|----------|----------|----------|----------|----------------|
 governance/             |      100 |      100 |      100 |      100 |                |
  Governance.sol         |      100 |      100 |      100 |      100 |                |
  SWID.sol               |      100 |      100 |      100 |      100 |                |
  WID.sol                |      100 |      100 |      100 |      100 |                |
 identity/               |      100 |    86.36 |      100 |      100 |                |
  EmployeeCard.sol       |      100 |    86.36 |      100 |      100 |                |
 identity/token/ERC5484/ |    66.67 |    33.33 |    83.33 |    61.54 |                |
  ERC5484.sol            |    66.67 |    33.33 |    83.33 |    61.54 | 76,79,82,97,99 |
  IERC5484.sol           |      100 |      100 |      100 |      100 |                |
-------------------------|----------|----------|----------|----------|----------------|
All files                |    94.32 |    88.28 |    96.88 |    95.15 |                |
-------------------------|----------|----------|----------|----------|----------------|
```
