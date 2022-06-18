import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { networkConfig } from "../helper-hardhat-config"

const deployGoFundMe: DeployFunction = async (hardHatRuntime: HardhatRuntimeEnvironment) => {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hardHatRuntime;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId: number = network.config.chainId!;

  let ethUsdPriceFeedAddress: string;
  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!;
  }
  
  log("==================================");
  log("Deploying GoFundMe...");
  const goFundMe = await deploy("GoFundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 0,
  });
  log(`GoFundMe deployed at ${goFundMe.address}`);
};

export default deployGoFundMe;
deployGoFundMe.tags = ["all", "goFundMe"];
