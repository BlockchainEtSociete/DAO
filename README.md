# WorkID [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents
- [WorkID ](#workid-)
  - [Table of Contents](#table-of-contents)
  - [Presentation](#presentation)
  - [Live demo](#live-demo)
    - [Public deployment](#public-deployment)
    - [Live video demonstration](#live-video-demonstration)
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

- Any web browser: TODO
- IPFS enabled web browser (like Brave): TODO

### Live video demonstration
You can see a demonstration in video at this URL: TODO

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
TODO
```

<a href="coverage"></a>
### Coverage

```bash
TODO
```
