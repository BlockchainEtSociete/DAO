import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@primitivefi/hardhat-dodoc';
import "solidity-coverage";
import "hardhat-deploy";

dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
  },
  paths: {
    deployments: '../front/src/contracts',
  },
  defaultNetwork: 'ganache',
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        count: 10,
      },
    },
    ganache: {
      accounts: {
        count: 10,
        mnemonic: `${process.env.MNEMONIC}`,
      },
      chainId: 1337,
      url: `http://localhost:8545`,
    },
    goerli: {
      accounts: {
        count: 10,
        mnemonic: `${process.env.MNEMONIC}`,
      },
      chainId: 5,
      url: `https://goerli.infura.io/v3/${process.env.INFURA_ID}`
    },
    sepolia: {
      accounts: {
        count: 10,
        mnemonic: `${process.env.MNEMONIC}`,
      },
      chainId: 11155111,
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_ID}`
    },
    mumbai: {
      accounts: {
        count: 10,
        mnemonic: `${process.env.MNEMONIC}`,
      },
      chainId: 80001,
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`
    }
  },
  namedAccounts: {
    deployer: 0,
  },
  gasReporter: {
    enabled: true,
    currency: "USD"
  }
};


export default config;
