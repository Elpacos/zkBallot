const circomlib = require("circomlibjs");
const { expect } = require("chai");
const snarkjs = require("snarkjs");
const ffjavascript = require("ffjavascript");
const utils = ffjavascript.utils;

import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";


import createDefaultProposal, { DEFAULT_CHOICES, DEFAULT_DESCRIPTION, MIN_DELAY, DEFAULT_DELAY } from "../utils/CreateDefaultProposal";
import { deployFactoryFixture, deployAndMintNFTMock } from "../utils/Fixtures";
const { generateCommitment } = require("../scripts/circuits/generateCommitment");
const merkleTree = require("../utils/lib/MerkleTree");
const PoseidonHasher = require("../utils/lib/Poseidon");

const ZERO_VALUE =
  "21663839004416932945382355908790599225266501822907911457504978515578255421292";

const { MERKLE_TREE_HEIGHT } = process.env

function toFixedHex(number: any, length = 32) {
    let str = BigInt(number).toString(16)
    while (str.length < length * 2) str = '0' + str
    str = '0x' + str
    return str
  }

describe("Proposal contract", function () {
    let owner: any, addr1: { address: any; }, addr2, ballotFactory: any;
    let verifier: any, poseidonContract: any;
    let whitelist, NFTContract: { address: any; };
    let proposal: any;
    let hasher: { hash: (arg1 : any, arg2 : any, arg3 : any) => any; };
    
    let tree: {
        root(): any; 
        insert: (arg0: any) => void; 
    };
    let levels = MERKLE_TREE_HEIGHT || 15

    beforeEach(async function () {
        const poseidon = await circomlib.buildPoseidon()
        //init hasher and merkle tree
        hasher = new PoseidonHasher(poseidon);
        tree = new merkleTree(
            levels,
            undefined,
            undefined,
            undefined,
            hasher
          );
        //deploy ballot factory and NFT contract
        ({ owner, addr1, addr2, ballotFactory, poseidonContract } = await loadFixture(deployFactoryFixture));
        ({ whitelist, NFTContract } = await deployAndMintNFTMock([addr1.address, addr2.address]));
        //create a new proposal that has not started yet
        proposal = await createDefaultProposal(
            "test1",
            3,
            NFTContract.address,
            false, //date flags
            false,
            ballotFactory,
            owner
        );
    });

    it("Should signup", async function () {
        //get the next index and generate a commitment
        let index = await proposal.nextIndex();   
        let input = await generateCommitment();
        //sign up with the commitment
        await expect(proposal.connect(addr1).signUp(input.commitment))
            .to.emit(proposal, "SignUp")
            .withArgs(input.commitment, index, anyValue) 
        //insert the commitment into the local merkle tree       
        tree.insert(input.commitment);

        //check if the commitment is in the tree
        const rootFromContract = await proposal.latestRoot();
        expect(rootFromContract.toString()).to.equal(await tree.root());
    });
    
    it("Should revert if the proposal has already started", async function () {
        await time.increase(DEFAULT_DELAY);
        let input = await generateCommitment();
        expect(proposal.connect(addr1).signUp(input.commitment))
            .to.be.revertedWithCustomError(proposal, "VotingPeriodStarted");    
    });

    it("Should revert if the user has already signed", async function () {
        //get two commitments
        let input = await generateCommitment();
        let input2 = await generateCommitment();
        //sign up with the first commitment
        await proposal.connect(addr1).signUp(input.commitment); 
        //try to sign up with the second commitment  
        expect(proposal.connect(addr1).signUp(input2.commitment))
            .to.be.revertedWithCustomError(proposal, "UnAuthorizedCaller");    
    });

    it("Should revert if the commitment has been already used", async function () {
        let input = await generateCommitment();
        //sign up with the first commitment
        await proposal.connect(addr1).signUp(input.commitment); 
        //try to sign up with the second commitment  
        expect(proposal.connect(addr1).signUp(input.commitment))
            .to.be.revertedWithCustomError(proposal, "UsedCommitment")
            .withArgs(input.commitment);    
    });

    it("Should be able to vote with zk proof", async function () {
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
        await proposal.connect(addr1).signUp(input.commitment);    
    });
});


/*         const PoseidonHasher = await ethers.getContractAt("IHasher", poseidonContract.address);
        const hashFromContract = await PoseidonHasher.poseidon([input.commitment, toFixedHex(ZERO_VALUE)]);
        console.log("hashFromContract: ", hashFromContract);
         */