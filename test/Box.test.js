// test/Box.test.js
// Load dependencies
const { expect } = require('chai');
const { ethers } = require("hardhat");

describe("Box", function () {
  const value = 42;
  let owner, other;
  
  before(async function () {
    [owner, other] = await ethers.getSigners();
    const Box = await ethers.getContractFactory("Box");
    this.box = await Box.deploy();
  });

  beforeEach(async function () {
  });

  it('retrieve returns a value previously stored', async function () {
    await this.box.store(value);

    // Use large integer comparisons
    expect(await this.box.retrieve()).to.equal(value);
  });

  it('store emits an event', async function () {
    const receipt = await this.box.store(value);
    expect(receipt).to.emit(this.box, 'ValueChanged').withArgs(value);
  });

  it('non owner cannot store a value', async function () {
    // Test a transaction reverts
    await expect(
      this.box.connect(other).store(value)).to.be.revertedWith('Ownable: caller is not the owner');
  });
});