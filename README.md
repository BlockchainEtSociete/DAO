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
      ✓ Require - Should revert when proposal start time is in the past
      ✓ Require - Should revert when proposal end time is before start time
      ✓ Require - Should revert when proposal description is empty
      ✓ UseCase - Should register proposal
    getOneProposalSession
      ✓ Require - Should revert if user is not employee
      ✓ Require - Should revert if user is not eligible to governance (no sWID tokens)
      ✓ Require - Revert if sessionId doesn't exists
      ✓ UseCase - Return proposal session information when it exists
    getVotingSessionStatus
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
      ✓ Require - Should revert when voting session doesn't exist
      ✓ Require - Should revert when session hasn't started yet
      ✓ Require - Should revert when user has already voted
      ✓ Require - Should revert when user has not enough voting power
      ✓ UseCase - Should register vote when user meets all the requirements.
    getVoterStatus
      ✓ Require - Should revert when voting session doesn't exist
      ✓ UseCase - Should return false if user hasn't voted yet

·-------------------------------------------|----------------------------|-------------|-----------------------------·
|           Solc version: 0.8.17            ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 30000000 gas  │
············································|····························|·············|······························
|  Methods                                                                                                           │
·················|··························|··············|·············|·············|···············|··············
|  Contract      ·  Method                  ·  Min         ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
·················|··························|··············|·············|·············|···············|··············
|  EmployeeCard  ·  burnCard                ·           -  ·          -  ·      60870  ·            1  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  EmployeeCard  ·  invalidateEmployeeCard  ·           -  ·          -  ·      50402  ·            3  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  EmployeeCard  ·  mint                    ·           -  ·          -  ·     223302  ·           34  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  Governance    ·  addProposal             ·           -  ·          -  ·     142194  ·           11  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  Governance    ·  stackWID                ·      244112  ·     244521  ·     244430  ·           21  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  Governance    ·  voteOnProposal          ·           -  ·          -  ·     142989  ·            3  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  WID           ·  approve                 ·           -  ·          -  ·      46911  ·           21  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  WID           ·  mint                    ·           -  ·          -  ·      71235  ·           21  ·          -  │
·················|··························|··············|·············|·············|···············|··············
|  Deployments                              ·                                          ·  % of limit   ·             │
············································|··············|·············|·············|···············|··············
|  EmployeeCard                             ·           -  ·          -  ·    3775694  ·       12.6 %  ·          -  │
············································|··············|·············|·············|···············|··············
|  Governance                               ·           -  ·          -  ·    5187283  ·       17.3 %  ·          -  │
············································|··············|·············|·············|···············|··············
|  WID                                      ·           -  ·          -  ·    1628060  ·        5.4 %  ·          -  │
·-------------------------------------------|--------------|-------------|-------------|---------------|-------------·

  43 passing (8s)

✨  Done in 10.86s.
```

<a href="coverage"></a>
### Coverage

```bash
-------------------------|----------|----------|----------|----------|----------------|
File                     |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------------------|----------|----------|----------|----------|----------------|
 governance/             |    80.77 |       70 |    83.33 |    83.08 |                |
  Governance.sol         |    96.55 |    76.67 |    91.67 |    97.37 |             90 |
  SWID.sol               |     61.9 |    61.54 |    66.67 |       64 |... 103,105,106 |
  WID.sol                |       50 |       25 |    66.67 |       50 |             18 |
 identity/               |      100 |    81.82 |      100 |      100 |                |
  EmployeeCard.sol       |      100 |    81.82 |      100 |      100 |                |
 identity/token/ERC5484/ |       60 |    33.33 |    66.67 |    53.85 |                |
  ERC5484.sol            |       60 |    33.33 |    66.67 |    53.85 |... 79,82,97,99 |
  IERC5484.sol           |      100 |      100 |      100 |      100 |                |
-------------------------|----------|----------|----------|----------|----------------|
All files                |    82.02 |    66.92 |    84.38 |     83.5 |                |
-------------------------|----------|----------|----------|----------|----------------|
```
