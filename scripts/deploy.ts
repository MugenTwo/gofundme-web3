import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractFactory("GoFundMe");
  const goFundMe = await contract.deploy();

  await goFundMe.deployed();

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
