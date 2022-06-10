import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { network, deployments, ethers } from "hardhat";
import { assert, expect } from "chai"
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
        it("Sets the aggregator addresses correctly", async () => {
            const response = await goFundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address)
        });
    });

    describe("fund", function () {
        it("Fails if did not send enough ETH", async () => {
            await expect(goFundMe.fund()).to.be.revertedWith("You need to fund with more ETH!")
        });

        it("Updates the amount in the funded address", async () => {
            await goFundMe.fund({ value: ethers.utils.parseEther("1") });
            const response = await goFundMe.getAddressToAmountFunded(deployer.address);
            assert.equal(response.toString(), ethers.utils.parseEther("1").toString());
        });

        it("Adds a funder to funders", async () => {
            await goFundMe.fund({ value: ethers.utils.parseEther("1") });
            const response = await goFundMe.getFunder(0);
            assert.equal(response, deployer.address);
        });
    });

});