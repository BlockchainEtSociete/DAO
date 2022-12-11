import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SWID Test", function () {
    async function deploySWID() {
        // Contracts are deployed using the first signer/account by default
        const [owner, minter1] = await ethers.getSigners();

        const WIDContract = await ethers.getContractFactory("WID");
        const widContract = await WIDContract.deploy();

        return { widContract, owner, minter1 };
    }

    context("Deployment", () => {
        it("Should get contract address", async function () {
            const { widContract } = await loadFixture(deploySWID);
            expect(await widContract.address).not.to.be.undefined;
        });
    });

    context("Mint", () => {
        it("Require - Should revert on called by other than owner", async () => {
            const { widContract, minter1 } = await loadFixture(deploySWID);

            await expect(widContract.connect(minter1).mint(minter1.address, ethers.utils.parseEther('1'))).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("UseCase - Should mint WID token when called by owner", async () => {
            const { widContract, owner, minter1 } = await loadFixture(deploySWID);
            const mintCall = await widContract.connect(owner).mint(minter1.address, ethers.utils.parseEther('1'));

            expect(mintCall).to.emit(widContract, 'Transfer').withArgs(0, minter1.address, ethers.utils.parseEther('1'));
        })
    })

    context("Burn", () => {
        it("Require - Should revert on called by other than owner", async () => {
            const { widContract, minter1 } = await loadFixture(deploySWID);

            await expect(widContract.connect(minter1).burn(minter1.address, ethers.utils.parseEther('1'))).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("UseCase - Should burn WID token when called by owner", async () => {
            const { widContract, owner, minter1 } = await loadFixture(deploySWID);
            
            await widContract.connect(owner).mint(minter1.address, ethers.utils.parseEther('1'));
            const burnCall = await widContract.connect(owner).burn(minter1.address, ethers.utils.parseEther('1'));

            expect(burnCall).to.emit(widContract, 'Transfer').withArgs(minter1.address, 0, ethers.utils.parseEther('1'));
        })
    })
});