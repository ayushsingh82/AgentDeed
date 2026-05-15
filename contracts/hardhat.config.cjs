require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

const { OG_RPC_URL, DEPLOYER_PRIVATE_KEY } = process.env;

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    ogGalileo: {
      url: OG_RPC_URL || "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
