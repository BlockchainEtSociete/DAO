import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("WorkID SBT", function () {
  async function deploySBT() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const SBT = await ethers.getContractFactory("SBT");
    const sbt = await SBT.deploy();

    return { sbt, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should get contract address", async function () {
      const { sbt } = await loadFixture(deploySBT);

      expect(await sbt.address).not.to.be.undefined;
    });
  });
});
