const { expect } = require("chai");
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
const snarkjs = require("snarkjs");
import createDefaultVoting from "../utils/CreateDefaultVoting";
import deployFactoryFixture from "../utils/Fixtures";
import getPoseidonFactory from "../utils/PoseidonFactory";
const ffjavascript = require("ffjavascript");
const utils = ffjavascript.utils;
const { generateCommitment } = require("../transactions/generateCommitment");
const { FIELD_SIZE } = require("../constants/constants");

describe("VotingFactory contract", function () {
  it("Deployment should assign parameters correctly", async function () {
    const { owner, addr1, votingFactory, verifier, poseidonContract } =
      await loadFixture(deployFactoryFixture);

    expect(await votingFactory.owner()).to.equal(owner.address);
    expect(await votingFactory.verifier()).to.equal(verifier.address);
    expect(await votingFactory.hasher()).to.equal(poseidonContract.address);
  });
  it("Should signup", async function () {
    const { owner, addr1, addr2, votingFactory } = await loadFixture(
      deployFactoryFixture
    );
    //create a new voting
    const voting = await createDefaultVoting(
      "test1",
      3,
      false,
      false,
      [addr1.address, addr2.address],
      votingFactory,
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
  });
});
