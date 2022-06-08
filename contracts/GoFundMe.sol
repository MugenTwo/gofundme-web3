// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error GoFundMe__NotOwner();

contract GoFundMe {
    
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 10**18;
    address private immutable owner;
    address[] private funders;
    mapping(address => uint256) private fundsByAddress;
    AggregatorV3Interface private priceFeed;

    modifier onlyOwner() {
        if (msg.sender != owner) revert GoFundMe__NotOwner();
        _;
    }

    constructor(address pricedFeedAddress) {
        priceFeed = AggregatorV3Interface(pricedFeedAddress);
        owner = msg.sender;
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        fundsByAddress[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            fundsByAddress[funder] = 0;
        }
        funders = new address[](0);

        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory currentFunders = funders;

        for (
            uint256 funderIndex = 0;
            funderIndex < currentFunders.length;
            funderIndex++
        ) {
            address funder = currentFunders[funderIndex];
            fundsByAddress[funder] = 0;
        }
        funders = new address[](0);

        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }

    function getAddressToAmountFunded(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return fundsByAddress[fundingAddress];
    }

    function getVersion() public view returns (uint256) {
        return priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
    
}
