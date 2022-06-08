import { HardhatUserConfig } from "hardhat/config";

import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/block-number";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  networks: {
    localhost: {
      url: "localhost:8545",
      chainId: 31337
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
  }
};

export default config;
