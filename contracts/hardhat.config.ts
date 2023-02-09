import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";
require("hardhat-tracer");

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      }],
    overrides: {
      "contracts/verifier.sol": {
        version: "0.6.11",
        settings: { }
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      },
    },
    
  },
  paths: {
    tests: "./tests",
  }  
};

export default config;
