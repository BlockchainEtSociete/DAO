# Blockchain & Société DAO [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents
- [Project](#bsdao-)
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

<a name="presentation"></a>
## Presentation
This project allows to manage tour membership to B&S. It also gives you access to thé association services using a secure SBT based authentication mechanism, and rights to participate at the association. 

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
