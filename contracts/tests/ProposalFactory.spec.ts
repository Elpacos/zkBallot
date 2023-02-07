const { expect } = require("chai");
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import createDefaultProposal, { DEFAULT_CHOICES, DEFAULT_DESCRIPTION } from "../utils/CreateDefaultProposal";
const snarkjs = require("snarkjs");
import { deployFactoryFixture ,deployAndMintNFTMock } from "../utils/Fixtures";
const ffjavascript = require("ffjavascript");
const utils = ffjavascript.utils;
const { generateCommitment } = require("../transactions/generateCommitment");

describe("BallotFactory contract", function () {

  it("Deployment should assign parameters correctly", async function () {
    const { owner, addr1, ballotFactory, verifier, poseidonContract } =
      await loadFixture(deployFactoryFixture);
    
    // Check the owner, verifier and hasher addresses are correct
    expect(await ballotFactory.owner()).to.equal(owner.address);
    expect(await ballotFactory.verifier()).to.equal(verifier.address);
    expect(await ballotFactory.hasher()).to.equal(poseidonContract.address);
  });

  it("Should create a new Proposal correctly", async function () {
    // Load the fixtures
    const { owner, addr1, addr2, ballotFactory } = await loadFixture(deployFactoryFixture);
    const { whitelist, NFTContract } = await deployAndMintNFTMock([addr1.address, addr2.address]);
    
    //create a new voting
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
    expect(await proposal.owner()).to.equal(ballotFactory.address);   
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
/*   it("Should signup", async function () {
    const { owner, addr1, addr2, ballotFactory } = await loadFixture(
      deployFactoryFixture
    );
    const { whitelist, nft } = await deployAndMintNFTMock([addr1.address, addr2.address]);
    //create a new voting
    const voting = await createDefaultVoting(
      "test1",
      3,
      false,
      false,
      [addr1.address, addr2.address],
      ballotFactory,
      owner
    );

    let input = await generateCommitment();
    while (utils.leBuff2int(input.commitment) >= FIELD_SIZE) {
      input = await generateCommitment();
    }
    let result = utils.leBuff2int(input.commitment);
    console.log(result);
    //signup
    await voting.connect(addr1).signUp(input.commitment);
  }); */
});
