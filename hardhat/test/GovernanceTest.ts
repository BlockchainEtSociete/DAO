import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import dayjs from "dayjs";

describe("Governance Test", function () {
    enum SessionStatus {
        Pending = 0,
        InProgress = 1,
        Ended = 2,
    }

    async function deployGovernance() {
        // Contracts are deployed using the first signer/account by default
        const [owner, employee1, employee2] = await ethers.getSigners();

        const WIDContract = await ethers.getContractFactory("WID");
        const widContract = await WIDContract.deploy();
        const EmployeeCardContract = await ethers.getContractFactory("EmployeeCard");
        const employeeCard = await EmployeeCardContract.deploy('Alyra Employee Card', 'AEC');

        const Governance = await ethers.getContractFactory("Governance");
        const governance = await Governance.deploy(widContract.address, employeeCard.address);

        return { governance, widContract, employeeCard, owner, employee1, employee2 };
    }

    context("Deployment", () => {
        it("Should get contract address", async function () {
        const { governance } = await loadFixture(deployGovernance);

        expect(await governance.address).not.to.be.undefined;
        });
    });

    context("addProposal", () => {
        it("Require - Should revert if called by other than an employee", async () => {
            const { governance, employee1 } = await loadFixture(deployGovernance);

            await expect(governance.connect(employee1).addProposal('description', BigNumber.from(dayjs().unix()), BigNumber.from(dayjs().add(1, 'day').unix()))).to.be.revertedWith("EmployeeCard: This address doesn't have any employee card.");
        })

        it("Require - Should revert if employee card has expired", async () => {
            const { governance, employeeCard, owner, employee1 } = await loadFixture(deployGovernance);
            
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const timestamp = await time.latest();
            await employeeCard.connect(owner).invalidateEmployeeCard(BigNumber.from(1), BigNumber.from(timestamp+20));

            await time.increase(60);

            await expect(governance.connect(employee1).addProposal('description', BigNumber.from(dayjs().unix()), BigNumber.from(dayjs().add(1, 'day').unix()))).to.be.revertedWith("Your employee card must still be valid to participate to the governance");
        })

        it("Require - Should revert if user is not eligible to governance (no sWID tokens)", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

            await expect(governance.connect(employee1).addProposal('description', BigNumber.from(dayjs().unix()), BigNumber.from(dayjs().add(1, 'day').unix()))).to.be.revertedWith("WorkID Governance: You don't have any voting power.");
        })

        it("Require - Should revert when proposal start time is in the past", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().subtract(1, 'day').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await expect(governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime))).to.be.revertedWith("Your proposal can't be in the past");
        })

        it("Require - Should revert when proposal end time is before start time", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(2, 'days').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await expect(governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime))).to.be.revertedWith("Your proposal end date can't be before the start date");
        })

        it("Require - Should revert when proposal description is empty", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = '';
            const startTime = dayjs().add(1, 'minute').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await expect(governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime))).to.be.revertedWith("Your proposal can't be empty");
        })

        it("UseCase - Should register proposal", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(1, 'minute').unix();
            const endTime = dayjs().add(1, 'day').unix();

            const proposalRegistrationReceipt = await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));
            expect(proposalRegistrationReceipt).to.emit(governance, 'ProposalSessionRegistered').withArgs(0);
        })
    })

    context("getOneProposalSession", () => {
        it("Require - Should revert if user is not eligible to governance (no sWID tokens)", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

            await expect(governance.connect(employee1).getOneProposalSession(0)).to.be.revertedWith("WorkID Governance: You don't have any voting power.");
        })

        it("Require - Should revert if user is not employee", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);
            await expect(governance.connect(employee1).getOneProposalSession(0)).to.be.revertedWith("EmployeeCard: This address doesn't have any employee card.");
        })

        it("Require - Revert if sessionId doesn't exists", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            await expect(governance.connect(employee1).getOneProposalSession(0)).to.be.revertedWith('Governance: Invalid voting session');
        })

        it("UseCase - Return proposal session information when it exists", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(1, 'minute').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));
            const votingSession = await governance.connect(employee1).getOneProposalSession(0);

            expect(votingSession.startTime).to.equal(startTime);
            expect(votingSession.endTime).to.equal(endTime);
            expect(votingSession.proposal.description).to.equal(description);
        })
    });

    context("getVotingSessionStatus", () => {
        it("Require - Should revert if called by other than an employee", async () => {
            const { governance, employee1 } = await loadFixture(deployGovernance);

            await expect(governance.connect(employee1).getVotingSessionStatus(BigNumber.from(0))).to.be.revertedWith("EmployeeCard: This address doesn't have any employee card.");
        })

        it("Require - Should revert if user is not eligible to governance (no sWID tokens)", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

            await expect(governance.connect(employee1).getVotingSessionStatus(BigNumber.from(0))).to.be.revertedWith("WorkID Governance: You don't have any voting power.");
        })

        it("Require - Should revert when voting session doesn't exist", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            await expect(governance.connect(employee1).getVotingSessionStatus(BigNumber.from(0))).to.be.revertedWith("Governance: Voting session doesn't exist");
        })

        it("UseCase - Should return pending when start time is in the future", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(1, 'minute').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));

            const sessionStatus = await governance.connect(employee1).getVotingSessionStatus(BigNumber.from(0));

            expect(sessionStatus).to.equal(SessionStatus.Pending);
        })

        it("UseCase - Should return in progress when start time is in the past and end time time in the future", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(2, 'minute').unix();
            const endTime = dayjs().add(1, 'day').unix();
            await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));

            await time.increase(600);
            const sessionStatus = await governance.connect(employee1).getVotingSessionStatus(BigNumber.from(0));

            expect(sessionStatus).to.equal(SessionStatus.InProgress);
        })

        it("UseCase - Should return ended when end time is in the past", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(1, 'minute').unix();
            const endTime = dayjs().add(1, 'day').unix();
            await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));

            await time.increase(90000);
            const sessionStatus = await governance.connect(employee1).getVotingSessionStatus(BigNumber.from(0));

            expect(sessionStatus).to.equal(SessionStatus.Ended);
        })
    });

    context("getVotingPower", () => {
        it("Require - Should revert if not valid employee", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            await expect(governance.connect(employee1).getVotingPower()).to.be.revertedWith("EmployeeCard: This address doesn't have any employee card.");
        })

        it("Require - Should revert if not voter", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            await expect(governance.connect(employee1).getVotingPower()).to.be.revertedWith("WorkID Governance: You don't have any voting power.");
        })

        it("UseCase - Should return amount of 0.1 * WID stacked for 6 months period in voting power", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);


            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const votingPower = await governance.connect(employee1).getVotingPower();

            expect(votingPower).to.equal(ethers.utils.parseEther('0.1'));
        })
        
        it("UseCase - Should return amount of 0.2 * WID stacked for 1 year period in voting power", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);


            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(31536000), ethers.utils.parseEther('1'));

            const votingPower = await governance.connect(employee1).getVotingPower();

            expect(votingPower).to.equal(ethers.utils.parseEther('0.2'));
        })
        
        it("UseCase - Should return amount of 0.6 * WID stacked for 3 years period in voting power", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);


            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(94608000), ethers.utils.parseEther('1'));

            const votingPower = await governance.connect(employee1).getVotingPower();

            expect(votingPower).to.equal(ethers.utils.parseEther('0.6'));
        })
        
        it("UseCase - Should return amount of WID stacked for 5 years period in voting power", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);


            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(157680000), ethers.utils.parseEther('1'));

            const votingPower = await governance.connect(employee1).getVotingPower();

            expect(votingPower).to.equal(ethers.utils.parseEther('1'));
        })
    });

    context("voteOnProposal", () => {
        it("Require - Should revert if called by other than an employee", async () => {
            const { governance, employee1 } = await loadFixture(deployGovernance);

            await expect(governance.connect(employee1).voteOnProposal(BigNumber.from(0), false, ethers.utils.parseEther('0.1'))).to.be.revertedWith("EmployeeCard: This address doesn't have any employee card.");
        })

        it("Require - Should revert if user is not eligible to governance (no sWID tokens)", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

            await expect(governance.connect(employee1).voteOnProposal(BigNumber.from(0), false, ethers.utils.parseEther('0.1'))).to.be.revertedWith("WorkID Governance: You don't have any voting power.");
        })

        it("Require - Should revert when voting session doesn't exist", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            await expect(governance.connect(employee1).voteOnProposal(BigNumber.from(0), false, ethers.utils.parseEther('0.1'))).to.be.revertedWith("Governance: Voting session doesn't exist");
        })

        it("Require - Should revert when session hasn't started yet", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(1, 'minute').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));

            await expect(governance.connect(employee1).voteOnProposal(BigNumber.from(0), false, ethers.utils.parseEther('0.1'))).to.be.revertedWith("Governance: Voting session isn't open yet");
        })

        it("Require - Should revert when user has already voted", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(2, 'minutes').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));

            await await time.increase(600);
            governance.connect(employee1).voteOnProposal(BigNumber.from(0), true, ethers.utils.parseEther('0.1'));

            await expect(governance.connect(employee1).voteOnProposal(BigNumber.from(0), true, ethers.utils.parseEther('0.1'))).to.be.revertedWith('Governance: You have already voted');
        })

        it("Require - Should revert when user has not enough voting power", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(2, 'minutes').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));

            await await time.increase(600);
            await expect(governance.connect(employee1).voteOnProposal(BigNumber.from(0), true, ethers.utils.parseEther('2'))).to.be.revertedWith("Governance: You don't have enough SWIDs for the chosen amount of voting power");
        })

        it("UseCase - Should register vote Yes when user meets all the requirements.", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(2, 'minutes').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));

            await await time.increase(600);
            const voteReceipt = governance.connect(employee1).voteOnProposal(BigNumber.from(0), true, ethers.utils.parseEther('0.1'));

            expect(voteReceipt).to.emit(governance, 'Voted').withArgs(employee1.address, BigNumber.from(0), true, ethers.utils.parseEther('0.1'));
        })

        it("UseCase - Should register vote No when user meets all the requirements.", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(2, 'minutes').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));

            await await time.increase(600);
            const voteReceipt = governance.connect(employee1).voteOnProposal(BigNumber.from(0), false, ethers.utils.parseEther('0.1'));

            expect(voteReceipt).to.emit(governance, 'Voted').withArgs(employee1.address, BigNumber.from(0), true, ethers.utils.parseEther('0.1'));
        })

    });

    context("getVoterStatus", () => {

        it("Require - Should revert if called by other than an employee", async () => {
            const { governance, employee1 } = await loadFixture(deployGovernance);

            await expect(governance.connect(employee1).getVoterStatus(BigNumber.from(0))).to.be.revertedWith("EmployeeCard: This address doesn't have any employee card.");
        })

        it("Require - Should revert if user is not eligible to governance (no sWID tokens)", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

            await expect(governance.connect(employee1).getVoterStatus(BigNumber.from(0))).to.be.revertedWith("WorkID Governance: You don't have any voting power.");
        })

        it("Require - Should revert when voting session doesn't exist", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            await expect(governance.connect(employee1).getVoterStatus(BigNumber.from(0))).to.be.revertedWith("Governance: Voting session doesn't exist");
        })

        it("UseCase - Should return false if user hasn't voted yet", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);

            // Ensure the user has rights to participate to governance.
            // 1 valid employee card and sWID tokens.
            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');
            
            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('10'));

            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(BigNumber.from(15768000), ethers.utils.parseEther('1'));

            const description = 'A wonderful proposal';
            const startTime = dayjs().add(1, 'minute').unix();
            const endTime = dayjs().add(1, 'day').unix();

            await governance.connect(employee1).addProposal(description, BigNumber.from(startTime), BigNumber.from(endTime));
            const voterStatus = await governance.connect(employee1).getVoterStatus(BigNumber.from(0));

            expect(voterStatus).to.equal(false);
        })
    })

    context("getStackingContractAddress", () => {
        it("Require - Should revert if called by other than an employee", async () => {
            const { governance, employee1 } = await loadFixture(deployGovernance);
            await expect(governance.connect(employee1).getStackingContractAddress()).to.be.revertedWith("EmployeeCard: This address doesn't have any employee card.");

        })
    })

    context("stackWID", () => {
        it("Require - Should revert if called by other than an employee", async () => {
            const { governance, employee1 } = await loadFixture(deployGovernance);

            await expect(governance.connect(employee1).stackWID(15768000, 0)).to.be.revertedWith("EmployeeCard: This address doesn't have any employee card.");
        })
    })

    context("unstackWID", () => {
        it("Require - Should revert if called by other than an employee", async () => {
            const { governance, employee1 } = await loadFixture(deployGovernance);

            await expect(governance.connect(employee1).unstackWID(0)).to.be.revertedWith("EmployeeCard: This address doesn't have any employee card.");
        })

        it("UseCase - Should unstack successfully after stacking period", async () => {
            const { governance, employeeCard, widContract, owner, employee1 } = await loadFixture(deployGovernance);
            
            const timestamp = await time.latest();
            const timestampAfter = dayjs.unix(timestamp).add(7, 'months').unix();

            await employeeCard.connect(owner).mint(employee1.address, 'https://www.alyra.fr');

            const sWIDAddress = await governance.connect(employee1).getStackingContractAddress();
            await widContract.connect(owner).mint(employee1.address, ethers.utils.parseEther('2'));
            await widContract.connect(employee1).approve(sWIDAddress, ethers.utils.parseEther('2'));

            await governance.connect(employee1).stackWID(15768000, ethers.utils.parseEther('1'));
            await governance.connect(employee1).stackWID(31536000, ethers.utils.parseEther('1'));


            const WIDbalance1 = await widContract.connect(employee1).balanceOf(employee1.address);
            const SWIDBalance1 = await governance.connect(employee1).getVotingPower();

            expect(WIDbalance1).to.equal(ethers.utils.parseEther('0'));
            expect(SWIDBalance1).to.equal(ethers.utils.parseEther('0.3'));

            await time.increaseTo(timestampAfter);

            await governance.connect(employee1).unstackWID(0);

            const WIDbalance2 = await widContract.connect(employee1).balanceOf(employee1.address);
            const SWIDBalance2 = await governance.connect(employee1).getVotingPower();

            expect(WIDbalance2).to.equal(ethers.utils.parseEther('1'));
            expect(SWIDBalance2).to.equal(ethers.utils.parseEther('0.2'));
        })

    })
});