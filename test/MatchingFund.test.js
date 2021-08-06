const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MatchingFund Single Funder", function () {
  let owner, donor1, donor2, recipient;
  
  before(async function () {
    [owner, donor1, donor2, donor3, recipient, recipient2] = await ethers.getSigners();
    const CustomCoin = await ethers.getContractFactory("CustomCoin");
    this.coin = await CustomCoin.deploy();
    await this.coin.mint(owner.address, 100);
    await this.coin.mint(donor1.address, 100);
    await this.coin.mint(donor2.address, 100);
    await this.coin.mint(donor3.address, 100);
    const MatchingFund = await ethers.getContractFactory("MatchingFund");
    this.mf = await MatchingFund.deploy(this.coin.address, 60*60, 1, [donor1.address, donor2.address], [recipient.address]);
  });

  beforeEach(async function () {
  });

  it("Balance of donor1, donor2 should be 100", async function () {
    expect(await this.coin.balanceOf(donor1.address)).to.equal(100);
    expect(await this.coin.balanceOf(donor2.address)).to.equal(100);
    expect(await this.coin.balanceOf(recipient.address)).to.equal(0);
    expect(await this.coin.balanceOf(this.mf.address)).to.equal(0);
  });

  it("add funds to the matching fund", async function () {
    await this.coin.approve(this.mf.address, 75);
    await this.mf.addFunds(75);
    expect(await this.coin.balanceOf(this.mf.address)).to.equal(75);
  });

  it("reverts if the donor hasn't given an allowance to the matching fund", async function () {
    await expect(this.mf.connect(donor2).donate(recipient.address, 50)).to.be.revertedWith('ERC20: transfer amount exceeds allowance');
  });
  
  it('matches the donation', async function () {
    await this.coin.connect(donor2).approve(this.mf.address, 50);
    await this.mf.connect(donor2).donate(recipient.address, 50);
    expect(await this.coin.balanceOf(recipient.address)).to.equal(100);
  });
  
  it('reverts if fund is exhausted', async function () {
    await this.coin.connect(donor2).approve(this.mf.address, 50);
    await expect(this.mf.connect(donor2).donate(recipient.address, 50)).to.be.revertedWith('Insufficient funds to match this donation');
  });

  it("reverts if donor is not whitelisted", async function () {
    await this.coin.connect(donor3).approve(this.mf.address, 25);
    await expect(this.mf.connect(donor3).donate(recipient.address, 25)).to.be.revertedWith('You are not allowed to use this matching fund');
  });
  
  it("reverts if recipient is not whitelisted", async function () {
    await this.coin.connect(donor2).approve(this.mf.address, 25);
    await expect(this.mf.connect(donor2).donate(recipient2.address, 25)).to.be.revertedWith('You are not allowed to donate to this address with this matching fund');
  });
  
  it("adds a new donor in the whitelist", async function () {
    await this.mf.addDonor(donor3.address);
    await this.coin.connect(donor3).approve(this.mf.address, 5);
    await this.mf.connect(donor3).donate(recipient.address, 5);
    expect(await this.coin.balanceOf(recipient.address)).to.equal(110);
  });

  it("remove a donor from the whitelist", async function () {
    await this.mf.removeDonor(donor3.address);
    await this.coin.connect(donor3).approve(this.mf.address, 5);
    await expect(this.mf.connect(donor3).donate(recipient.address, 5)).to.be.revertedWith('You are not allowed to use this matching fund');
  });

  it("adds a new recipient in the whitelist", async function () {
    await this.mf.addRecipient(recipient2.address);
    await this.coin.connect(donor2).approve(this.mf.address, 5);
    await this.mf.connect(donor2).donate(recipient2.address, 5);
    expect(await this.coin.balanceOf(recipient2.address)).to.equal(10);
  });

  it("remove a recipient from the whitelist", async function () {
    await this.mf.removeRecipient(recipient2.address);
    await this.coin.connect(donor2).approve(this.mf.address, 5);
    await expect(this.mf.connect(donor2).donate(recipient2.address, 5)).to.be.revertedWith('You are not allowed to donate to this address with this matching fund');
  });
});
