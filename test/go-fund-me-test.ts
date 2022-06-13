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

    describe("withdraw", function () {
        beforeEach(async () => {
            await goFundMe.fund({ value: ethers.utils.parseEther("1") });
        })

        it("Withdraw from 1 funder", async () => {
            const startingFundMeBalance = await goFundMe.provider.getBalance(goFundMe.address);
            const startingDeployerBalance = await goFundMe.provider.getBalance(deployer.address);

            const transactionResponse = await goFundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait();
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await goFundMe.provider.getBalance(goFundMe.address);
            const endingDeployerBalance = await goFundMe.provider.getBalance(deployer.address);

            assert.equal(endingFundMeBalance.toString(), "0");
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            );
        });

        it("Withdraw from multiple funders", async () => {
            const accounts = await ethers.getSigners();

            for (let i = 1; i < 6; i++) {
                await goFundMe
                    .connect(accounts[i])
                    .fund({ value: ethers.utils.parseEther("1") });
            }

            const startingFundMeBalance = await goFundMe.provider.getBalance(goFundMe.address);
            const startingDeployerBalance = await goFundMe.provider.getBalance(deployer.address);
            const transactionResponse = await goFundMe.cheaperWithdraw();

            const transactionReceipt = await transactionResponse.wait();
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const withdrawGasCost = gasUsed.mul(effectiveGasPrice);

            console.log(`GasCost: ${withdrawGasCost}`);
            console.log(`GasUsed: ${gasUsed}`);
            console.log(`GasPrice: ${effectiveGasPrice}`);

            const endingDeployerBalance = await goFundMe.provider.getBalance(deployer.address);

            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(withdrawGasCost).toString()
            );

            await expect(goFundMe.getFunder(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    (await goFundMe.getAddressToAmountFunded(accounts[i].address)).toString(),
                    "0"
                );
            }
        });

        it("Only owner allowed to withdraw", async function () {
            const accounts = await ethers.getSigners();
            const goFundMeConnectedContract = await goFundMe.connect(accounts[1]);

            await expect(goFundMeConnectedContract.withdraw()).to.be.revertedWithCustomError(goFundMe, "GoFundMe__NotOwner")
        });
    });

});