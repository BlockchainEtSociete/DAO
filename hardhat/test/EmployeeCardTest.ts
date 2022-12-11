import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import dayjs from "dayjs";

describe("EmployeeCard Test", function () {
  async function deployEmployeeCard() {
    // Contracts are deployed using the first signer/account by default
    const [owner, employee1, employee2] = await ethers.getSigners();

    const EmployeeCard = await ethers.getContractFactory("EmployeeCard");
    const employeeCard = await EmployeeCard.deploy('Alyra Employee Card', 'AEC');

    return { employeeCard, owner, employee1, employee2 };
  }

  context("Deployment", () => {
    it("Should get contract address", async function () {
      const { employeeCard } = await loadFixture(deployEmployeeCard);

      expect(await employeeCard.address).not.to.be.undefined;
    });
  });

  context("Mint", () => {
    it("Require - Should revert when already minted", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      
      await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
      await expect(employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr')).to.be.revertedWith('An employee can only have 1 token');
    })

    it("Require - Should revert when not called by contract issuer", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      
      await expect(employeeCard.connect(employee1).mint(employee1.address, 'https://www.alyra.fr')).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it("Event - Should mint a new EmployeeCard and emit EmployeeCardMinted event", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      const mintReceipt = await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

      expect(mintReceipt).to.emit(employeeCard, 'EmployeeCardMinted').withArgs(employee1, 0);
    })

    it("UseCase - Should have owner of contract approved on tokenId after mint", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

      const approvedUser = await employeeCard.connect(owner).getApproved(1);

      expect(approvedUser).to.equal(owner.address);
    })
  })
  
  context("Get employee card id", () => {
    it("Require - Should revert on token id invalid", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      
      await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
      const tokenId = await employeeCard.connect(owner).getEmployeeCardId(employee1.address);

      expect(tokenId).to.equal(1);
    })

    it("Usecase - Should return the tokenId when it exists", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
    })
  })

  context("tokenURI", () => {
    it("Require - Should revert when tokenId don't exist", async () => {
      const { employeeCard, owner } = await loadFixture(deployEmployeeCard);

      await expect(employeeCard.connect(owner).tokenURI(BigNumber.from(1))).to.be.reverted;
    })

    it("Usecase - Should return minted token uri", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

      const tokenURI = await employeeCard.connect(owner).tokenURI(BigNumber.from(1));
      expect(tokenURI).to.equal('https://www.alyra.fr');
    })
  })

  context("isTokenValid", () => {
    it("Require - Should revert on token not minted", async () => {
      const { employeeCard, owner } = await loadFixture(deployEmployeeCard);

      await expect(employeeCard.connect(owner).isTokenValid(BigNumber.from(1))).to.be.revertedWith("ERC721: invalid token ID");
    })
    it("Require - Should revert on end time in the past", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

      await expect(employeeCard.connect(owner).invalidateEmployeeCard(BigNumber.from(1), BigNumber.from(dayjs().subtract(1, 'month').unix()))).to.be.revertedWith('EmployeeCard: you must specify a end time in the future');
    })
    it("UseCase - Should return that token is valid when no end time is set", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

      const tokenValid = await employeeCard.connect(owner).isTokenValid(BigNumber.from(1));

      expect(tokenValid).to.equal(true);
    })
    it("UseCase - Should return that token is valid when card has end time in the future", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

      await employeeCard.connect(owner).invalidateEmployeeCard(BigNumber.from(1), BigNumber.from(dayjs().add(1, 'month').unix()));
      const tokenValid = await employeeCard.connect(owner).isTokenValid(BigNumber.from(1));
    
      expect(tokenValid).to.equal(true);
    })

    it("Event - Should event on invalidation", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

      const endTime = dayjs().add(1, 'month').unix()
      const invalidationReceipt = await employeeCard.connect(owner).invalidateEmployeeCard(BigNumber.from(1), BigNumber.from(endTime));
      
      expect(invalidationReceipt).to.emit(employeeCard, 'EmployeeCardEnded').withArgs(1, endTime);
    })
  });

  context("Burn card", () => {
    it("Require - Should revert on no token for employee", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      await expect(employeeCard.connect(owner).burnCard(employee1.address)).to.be.revertedWith("EmployeeCard: This address doesn't have any employee card.");
    })

    it("Require - Should revert on not owner msg.sender", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);
      await expect(employeeCard.connect(employee1).burnCard(employee1.address)).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it("UseCase - Should burn token when called by issuer", async () => {
      const { employeeCard, owner, employee1 } = await loadFixture(deployEmployeeCard);

      await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
      const receipt = await expect(employeeCard.connect(owner).burnCard(employee1.address));

      expect(receipt).to.emit(employeeCard, 'Transfer').withArgs(employee1.address, 0, 1)
    })
  })
});
