const { expect } = require("chai");
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import createDefaultProposal, { DEFAULT_CHOICES, DEFAULT_DESCRIPTION, MIN_DELAY } from "../utils/CreateDefaultProposal";
import { deployFactoryFixture, deployAndMintNFTMock ,getTimeNow } from "../utils/Fixtures";

describe("BallotFactory contract", function () {
  let owner: any, addr1: { address: any; }, addr2, ballotFactory: any;
  let verifier: any, poseidonContract: any;
  let whitelist, NFTContract: { address: any; };

  beforeEach(async function () {
    // Load the fixtures
    ({ owner, addr1, addr2, ballotFactory, verifier, poseidonContract } = await loadFixture(deployFactoryFixture));
    ({ whitelist, NFTContract } = await deployAndMintNFTMock([addr1.address, addr2.address]));
  });

  it("Deployment initialize correctly", async function () {
    // Check the owner, verifier and hasher addresses are correct
    expect(await ballotFactory.owner()).to.equal(owner.address);
    expect(await ballotFactory.verifier()).to.equal(verifier.address);
    expect(await ballotFactory.hasher()).to.equal(poseidonContract.address);
  });

  it("Should create a new Proposal correctly", async function () {
    //create a new proposal
    const proposal = await createDefaultProposal(
      "test1",
      3,
      NFTContract.address,
      false, //date flags
      false,
      ballotFactory,
      owner
    );

    // Check the proposal was created correctly
    expect(await proposal.name()).to.equal("test1");
    expect(await proposal.description()).to.equal(DEFAULT_DESCRIPTION);
    expect(await proposal.tokenAddress()).to.equal(NFTContract.address);
    expect(await proposal.choiceNumber()).to.equal(3);
    expect(await proposal.choicesList()).to.deep.equal(DEFAULT_CHOICES.slice(0, 3));
    expect(await proposal.proposalId()).to.equal(await ballotFactory.id());
    expect(await proposal.host()).to.equal(owner.address);

    // Test getters
    expect(await proposal.hasStarted()).to.equal(false);
    expect(await proposal.hasEnded()).to.equal(false);
    expect(proposal.proposalResults()).to.be.reverted;
  });

  it("Should revert if startDate is not MIN_DELAY in the future", async function () {
    //create a new proposal that has not started yet
    expect(ballotFactory.connect(owner).createProposal(
      "test1",
      DEFAULT_DESCRIPTION,
      NFTContract.address,
      DEFAULT_CHOICES.slice(0, 3),
      getTimeNow(),
      getTimeNow() + MIN_DELAY + 1,
    )).to.be.revertedWithCustomError(ballotFactory, "InvalidStartDate");
  });

  it("Should revert if endDate - startDate is less than MIN_DELAY", async function () {
    let startDate = getTimeNow() + MIN_DELAY + 1;
    //create a new proposal that has not started yet
    expect(ballotFactory.connect(owner).createProposal(
      "test1",
      DEFAULT_DESCRIPTION,
      NFTContract.address,
      DEFAULT_CHOICES.slice(0, 3),
      startDate,
      startDate + 60 * 60 * 1,
    )).to.be.revertedWithCustomError(ballotFactory, "InvalidEndDate");
  });
});

