const { expect } = require("chai");
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import createDefaultProposal, { DEFAULT_CHOICES, DEFAULT_DESCRIPTION } from "../utils/CreateDefaultProposal";
const snarkjs = require("snarkjs");
import { deployFactoryFixture, deployAndMintNFTMock } from "../utils/Fixtures";
const ffjavascript = require("ffjavascript");
const utils = ffjavascript.utils;
const { generateCommitment } = require("../scripts/circuits/generateCommitment");

describe("Proposal contract", function () {
    let owner: any, addr1: { address: any; }, addr2, ballotFactory: any;
    let whitelist, NFTContract: { address: any; };

    beforeEach(async function () {
        ({ owner, addr1, addr2, ballotFactory } = await loadFixture(deployFactoryFixture));
        ({ whitelist, NFTContract } = await deployAndMintNFTMock([addr1.address, addr2.address]));
    });
    it("Should signup", async function () {
        //create a new proposal that has not started yet
        const proposal = await createDefaultProposal(
            "test1",
            3,
            NFTContract.address,
            false, //date flags
            false,
            ballotFactory,
            owner
        );

        let input = await generateCommitment();
        //signup
        //
        //console.log("input", utils.stringifyBigInts(input.commitment)); the same as toString(16)
        /* let hexString = input.commitment.toString(16);
        if (hexString.length % 2 == 1) {
            hexString = "0" + hexString;
        }
        hexString = "0x" + hexString;
        console.log("input", hexString); */
        //if 
        //"0x" + input.commitment.toString(16)
        console.log("input", input.commitment);
        await proposal.connect(addr1).signUp(input.commitment);    
    
    });
});
