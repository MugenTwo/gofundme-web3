import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

const DECIMALS = "18";
const INITIAL_PRICE = "1000000000000000000000";

const deployMocks: DeployFunction = async (hardHatRuntime: HardhatRuntimeEnvironment) => {
    // @ts-ignore
    const { deployments, getNamedAccounts, network } = hardHatRuntime;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (network.config.chainId == 31337) {
        log("Local network detected! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        })
        log("Mocks Deployed!");

        log("==================================");
        log("You are deploying to a local network");
        log("Please run `yarn hardhat console` to interact with the contracts!");
        log("==================================");
    }
}
export default deployMocks;
deployMocks.tags = ["all", "mocks"];
