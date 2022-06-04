import { task } from "hardhat/config";

task("block-number", "Prints the current block number").setAction(
   async (_, hardhatRuntime) => {
    const blockNumber = await hardhatRuntime.ethers.provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);
   }
)

module.exports = {};