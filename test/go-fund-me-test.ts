import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { network, deployments, ethers } from "hardhat";
import { assert } from "chai"
import { GoFundMe, MockV3Aggregator } from "../typechain-types";
import { developmentChains } from "../helper-hardhat-config"

describe("GoFundMe", () => {
    let goFundMe: GoFundMe;
    let mockV3Aggregator: MockV3Aggregator;
    let deployer: SignerWithAddress;

    beforeEach(async () => {
        if (!developmentChains.includes(network.name)) {
            throw "You need to be on a development chain to run tests";
        }
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["all"]);
        goFundMe = await ethers.getContract("GoFundMe");
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
    });

    describe("constructor", () => {
        it("sets the aggregator addresses correctly", async () => {
            const response = await goFundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address)
        })
    });

});