import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import dayjs from "dayjs";
import { ethers } from "hardhat";

describe("SWID Test", function () {

    async function deploySWID() {
        // Contracts are deployed using the first signer/account by default
        const [owner, stacker1, stacker2] = await ethers.getSigners();

        const WIDContract = await ethers.getContractFactory("WID");
        const widContract = await WIDContract.deploy();

        const SWIDContract = await ethers.getContractFactory("SWID");
        const swidContract = await SWIDContract.deploy(widContract.address);

        return { widContract, swidContract, owner, stacker1, stacker2 };
    }

    context("Deployment", () => {
        it("Should get contract address", async function () {
            const { swidContract } = await loadFixture(deploySWID);
            expect(await swidContract.address).not.to.be.undefined;
        });
    });

    context("stackWID", () => {
        it("Require - Should revert if called by other than the owner", async () => {
            const { swidContract, owner, stacker1 } = await loadFixture(deploySWID);

            await expect(swidContract.connect(stacker1).stackWID(15768000, stacker1.address, 0)).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Require - Should revert on zero or negative amount", async () => {
            const { swidContract, owner, stacker1 } = await loadFixture(deploySWID);

            await expect(swidContract.connect(owner).stackWID(15768000, stacker1.address, 0)).to.be.revertedWith("SWID: You must send a positive amount of WID");
        })

        it("Require - Should not accept duration other than 6 months, 1 year, 3 years or 5 years", async () => {
            const { swidContract, owner, stacker1 } = await loadFixture(deploySWID);

            await expect(swidContract.connect(owner).stackWID(123, stacker1.address, ethers.utils.parseEther('1'))).to.be.revertedWith("SWID: Duration must be either 6 months, 1 year, 3 years or 5 years");
        })

        it("UseCase - Should accept stacking WID for 6 months and return 0.1*WID", async () => {
            const { swidContract, widContract, owner, stacker1 } = await loadFixture(deploySWID);

            const timestamp = await time.latest();

            await widContract.connect(owner).mint(stacker1.address, ethers.utils.parseEther('1'));
            await widContract.connect(stacker1).approve(swidContract.address, ethers.utils.parseEther('1'));
            const stackCall = await swidContract.connect(owner).stackWID(15768000, stacker1.address, ethers.utils.parseEther('1'));

            const SWIDbalance = await swidContract.connect(owner).balanceOf(stacker1.address);
            const WIDbalance = await widContract.connect(owner).balanceOf(stacker1.address);

            expect(SWIDbalance).to.equal(ethers.utils.parseEther('0.1'));
            expect(WIDbalance).to.equal(ethers.utils.parseEther('0'));
            expect(stackCall).to.emit(swidContract, 'WIDStacked').withArgs(0, stacker1, ethers.utils.formatEther('1'), 15768000, timestamp);
        })

        it("UseCase - Should accept stacking WID for 1 year and return 0.2*WID", async () => {
            const { swidContract, widContract, owner, stacker1 } = await loadFixture(deploySWID);

            const timestamp = await time.latest();

            await widContract.connect(owner).mint(stacker1.address, ethers.utils.parseEther('1'));
            await widContract.connect(stacker1).approve(swidContract.address, ethers.utils.parseEther('1'));
            const stackCall = await swidContract.connect(owner).stackWID(31536000, stacker1.address, ethers.utils.parseEther('1'));

            const SWIDbalance = await swidContract.connect(owner).balanceOf(stacker1.address);
            const WIDbalance = await widContract.connect(owner).balanceOf(stacker1.address);

            expect(SWIDbalance).to.equal(ethers.utils.parseEther('0.2'));
            expect(WIDbalance).to.equal(ethers.utils.parseEther('0'));
            expect(stackCall).to.emit(swidContract, 'WIDStacked').withArgs(0, stacker1, ethers.utils.formatEther('1'), 31536000, timestamp);
        })

        it("UseCase - Should accept stacking WID for 1 year and return 0.6*WID", async () => {
            const { swidContract, widContract, owner, stacker1 } = await loadFixture(deploySWID);

            const timestamp = await time.latest();

            await widContract.connect(owner).mint(stacker1.address, ethers.utils.parseEther('1'));
            await widContract.connect(stacker1).approve(swidContract.address, ethers.utils.parseEther('1'));
            const stackCall = await swidContract.connect(owner).stackWID(94608000, stacker1.address, ethers.utils.parseEther('1'));

            const SWIDbalance = await swidContract.connect(owner).balanceOf(stacker1.address);
            const WIDbalance = await widContract.connect(owner).balanceOf(stacker1.address);

            expect(SWIDbalance).to.equal(ethers.utils.parseEther('0.6'));
            expect(WIDbalance).to.equal(ethers.utils.parseEther('0'));
            expect(stackCall).to.emit(swidContract, 'WIDStacked').withArgs(0, stacker1, ethers.utils.formatEther('1'), 94608000, timestamp);
        })

        it("UseCase - Should accept stacking WID for 5 year and return 1*WID", async () => {
            const { swidContract, widContract, owner, stacker1 } = await loadFixture(deploySWID);

            const timestamp = await time.latest();

            await widContract.connect(owner).mint(stacker1.address, ethers.utils.parseEther('1'));
            await widContract.connect(stacker1).approve(swidContract.address, ethers.utils.parseEther('1'));
            const stackCall = await swidContract.connect(owner).stackWID(157680000, stacker1.address, ethers.utils.parseEther('1'));

            const SWIDbalance = await swidContract.connect(owner).balanceOf(stacker1.address);
            const WIDbalance = await widContract.connect(owner).balanceOf(stacker1.address);

            expect(SWIDbalance).to.equal(ethers.utils.parseEther('1'));
            expect(WIDbalance).to.equal(ethers.utils.parseEther('0'));
            expect(stackCall).to.emit(swidContract, 'WIDStacked').withArgs(0, stacker1, ethers.utils.formatEther('1'), 157680000, timestamp);
        })
    })

    context("unstackWID", () => {
        it("Require - Should revert if called by other than the owner", async () => {
            const { swidContract, owner, stacker1 } = await loadFixture(deploySWID);

            await expect(swidContract.connect(stacker1).unstackWID(0, stacker1.address)).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Require - Should revert on deposit doesn't exist", async () => {
            const { swidContract, owner, stacker1 } = await loadFixture(deploySWID);

            await expect(swidContract.connect(owner).unstackWID(0, stacker1.address)).to.be.revertedWith("SWID: The specified deposit doesn't exist.");
        })

        it("Require - Should revert on trying to withdraw before stacking time", async () => {
            const { swidContract, widContract, owner, stacker1 } = await loadFixture(deploySWID);

            const timestamp = await time.latest();

            await widContract.connect(owner).mint(stacker1.address, ethers.utils.parseEther('1'));
            await widContract.connect(stacker1).approve(swidContract.address, ethers.utils.parseEther('1'));
            const stackCall = await swidContract.connect(owner).stackWID(15768000, stacker1.address, ethers.utils.parseEther('1'));

            await expect(swidContract.connect(owner).unstackWID(0, stacker1.address)).to.be.revertedWith("SWID: You can't unstack before stacking duration is fullfilled.");
        })

        it("UseCase - Should unstack successfully after stacking period", async () => {
            const { swidContract, widContract, owner, stacker1 } = await loadFixture(deploySWID);
            
            const timestamp = await time.latest();
            const timestampAfter = dayjs.unix(timestamp).add(7, 'months').unix();

            await widContract.connect(owner).mint(stacker1.address, ethers.utils.parseEther('1'));
            await widContract.connect(stacker1).approve(swidContract.address, ethers.utils.parseEther('1'));
            await swidContract.connect(owner).stackWID(15768000, stacker1.address, ethers.utils.parseEther('1'));

            await time.increaseTo(timestampAfter);

            const unstackCall = await swidContract.connect(owner).unstackWID(0, stacker1.address);

            expect(unstackCall).to.emit(swidContract, 'DepositUnstacked').withArgs(stacker1.address, ethers.utils.parseEther('1'));
            expect(unstackCall).to.emit(swidContract, 'SWIDBurnt').withArgs(ethers.utils.parseEther('0.1'));
        })

    })
});