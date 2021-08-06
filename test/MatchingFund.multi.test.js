const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MatchingFund with LPs", function () {
  let signers, owner, lp1, lp2, lp3, donor1, donor2, donor3, recipient;
  


  async function initCustomCoin(captable) {
    const CustomCoin = await ethers.getContractFactory("CustomCoin");
    const coin = await CustomCoin.deploy();
    await Promise.all(captable.map((amount, i) => {
      return new Promise(async (resolve, reject) => {
        await coin.mint(signers[i].address, amount);
        resolve();
      });
    }));
    return coin;
  }

  async function initMatchingFund(captable) {
    await Promise.all(captable.map((amount, i) => {
      return new Promise(async (resolve, reject) => {
        await this.coin.connect(signers[i]).approve(this.mf.address, amount);
        await this.mf.connect(signers[i]).addFunds(amount);
        resolve();
      });
    }));
  }


  async function getBalances(signers) {
    await Promise.all(signers.map((account, i) => {
      return new Promise(async (resolve, reject) => {
        const res = (await this.coin.balanceOf(signers[i].address)).toString();
        console.log(">>> balance of account", i, "is", res);        
        resolve();
      });
    }));
  }

  async function expectBalancesToEqual(balances) {
    await Promise.all(balances.map((balance, i) => {
      return new Promise(async (resolve, reject) => {
        const res = await this.coin.balanceOf(signers[i].address);
        // console.log(">>> expect balance of account", i, "(", res.toString(),") to equal", balance);
        expect(res).to.equal(balance);    
        resolve();
      });
    }));
  }


  before(async function () {
    signers = await ethers.getSigners();
    [owner, lp1, lp2, lp3, donor1, donor2, donor3, recipient] = signers;
    this.coin = await initCustomCoin([1000, 1000, 1000, 1000, 100, 100, 100]);
    expect(await this.coin.balanceOf(owner.address)).to.eq(1000);
    const MatchingFund = await ethers.getContractFactory("MatchingFund");
    this.mf = await MatchingFund.deploy(this.coin.address, 60*60, 100, [donor1.address, donor2.address], [recipient.address]);

    const balance = await this.coin.balanceOf(donor1.address);
  });

  beforeEach(async function () {
  });

  it("reverts if donations is below the minimum required to become a LP", async function() {
    await expect(this.mf.addFunds(50)).to.be.revertedWith("Donation must be higher to become an LP");
  });

  it("each LP adds funds to the matching fund", async function () {

    const captable = [400, 100, 200, 300];
    await initMatchingFund.call(this, captable);

    expect(await this.coin.balanceOf(this.mf.address)).to.equal(1000);
  });

  it("everyone gets back their initial funding when closing the fund", async function () {
    const balances = {};
    await this.mf.closeFund();
    await expectBalancesToEqual.call(this, [1000, 1000, 1000, 1000]);
    expect(await this.coin.balanceOf(this.mf.address)).to.eq(0);
  });
  
  it('everyone gets 90% of their initial funding after 10% of the fund has been used', async function () {
    initMatchingFund.call(this, [400, 100, 200, 300]);
    await this.coin.connect(donor2).approve(this.mf.address, 100);
    await this.mf.connect(donor2).donate(recipient.address, 100);
    expect(await this.coin.balanceOf(recipient.address)).to.equal(200);
    await this.mf.closeFund();
    await expectBalancesToEqual.call(this, [960, 990, 980, 970]);
    expect(await this.coin.balanceOf(this.mf.address)).to.eq(0);
  });

});
