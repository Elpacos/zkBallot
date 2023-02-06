const circomlib = require("circomlibjs");
const fs = require("fs");
const merkleTree = require("../lib/MerkleTree");
const MERKLE_TREE_HEIGHT = 15;
const bigInt = require("big-integer");
const ffjavascript = require("ffjavascript");
const utils = ffjavascript.utils;
const stringifyBigInts = ffjavascript.utils.stringifyBigInts;
import { FIELD_SIZE } from "../../../contracts/utils/constants/constants";

class PoseidonHasher {
  hash(level, left, right) {
    const h = poseidon([BigInt(left), BigInt(right)]);
    const parserdhash = poseidon.F.toString(h, 16);
    return "0x" + parserdhash;
  }
}

let babyJub;
let pedersenAlg;
let pedersenHash;
let poseidon;
let input = {};

function createDeposit(nullifier, secret) {
  let deposit = { nullifier, secret };
  deposit.preimage = Buffer.concat([deposit.nullifier, deposit.secret]);
  deposit.commitment = pedersenHash(deposit.preimage);
  deposit.nullifierHash = pedersenHash(deposit.nullifier);
  return deposit;
}

const F = new ffjavascript.ZqField(ffjavascript.Scalar.fromString(FIELD_SIZE));
async function generateWitness() {
  babyJub = await circomlib.buildBabyjub();
  pedersenAlg = await circomlib.buildPedersenHash();
  pedersenHash = (data) => babyJub.unpackPoint(pedersenAlg.hash(data))[0];
  poseidon = await circomlib.buildPoseidon();

  let nullifier1 = Buffer.from("5521312211235521312211235521312");
  let secret1 = Buffer.from("5521312211235521312211235521313");
  const createdDeposit1 = createDeposit(nullifier1, secret1);

  input.nullifier = stringifyBigInts(utils.leBuff2int(nullifier1));
  input.nullifierHash = stringifyBigInts(
    F.fromRprLEM(createdDeposit1.nullifierHash)
  );
  input.secret = stringifyBigInts(utils.leBuff2int(secret1));

  let nullifier2 = Buffer.from("5521312211235521312211235521322");
  let secret2 = Buffer.from("5521312211235521312211235521212");
  const createdDeposit2 = createDeposit(nullifier2, secret2);

  //Array.from(createdDeposit.commitment.values()
  const hasher = new PoseidonHasher();
  console.log(hasher);

  const tree = new merkleTree(
    MERKLE_TREE_HEIGHT,
    [
      stringifyBigInts(F.fromRprLEM(createdDeposit1.commitment)),
      stringifyBigInts(F.fromRprLEM(createdDeposit2.commitment)),
    ],
    undefined,
    undefined,
    hasher
  );

  //Now we are going to find the merkle tree proof that is computed for the 1st
  //commitment that was inserted in the tree (createdDeposit1.commmitment, that has an index 0 inside the tree)
  const { root, path_elements, path_index } = await tree.path(1);
  input.top = root;
  input.pathElements = path_elements;
  input.pathIndices = path_index;
  return input;
}

module.exports = { generateWitness };

/* main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
 */
/**
 * @param root --> Merkle tree root
 * @param nullifier --> value created by the user
 * @param secret --> value created by the user
 * @param nullifierHash --> nullifier hashed with pedersen alg
 * @param path_elements --> merkle tree proof elements
 * @param path_indices --> merkle tree proof elements
 */
