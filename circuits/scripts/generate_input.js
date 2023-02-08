const circomlib = require("circomlibjs");
const merkleTree = require("../lib/MerkleTree");
const MERKLE_TREE_HEIGHT = 15;
const { generateCommitment } = require("../../contracts/scripts/circuits/generateCommitment");


class PoseidonHasher {
  hash(level, left, right) {
    const h = poseidon([BigInt(left), BigInt(right)]);
    const parserdhash = poseidon.F.toString(h, 16);
    return "0x" + parserdhash;
  }
}

let babyJub;
let poseidon;
let input = {};

/* function createDeposit(nullifier, secret) {
  let deposit = { nullifier, secret };
  deposit.preimage = Buffer.concat([deposit.nullifier, deposit.secret]);
  deposit.commitment = pedersenHash(deposit.preimage);
  deposit.nullifierHash = pedersenHash(deposit.nullifier);
  return deposit;
} */


async function generateWitness() {
  poseidon = await circomlib.buildPoseidon();
  poseidonHash = (data) => babyJub.unpackPoint(poseidon.hash(data))[0];
  

  const input1 = await generateCommitment();
  const input2 = await generateCommitment();

  //Array.from(createdDeposit.commitment.values()
  const hasher = new PoseidonHasher();

  const tree = new merkleTree(
    MERKLE_TREE_HEIGHT,
    [
      input1.commitment,
      input2.commitment,
    ],
    undefined,
    undefined,
    hasher
  );

  //Now we are going to find the merkle tree proof that is computed for the 1st
  //commitment that was inserted in the tree (createdDeposit1.commmitment, that has an index 0 inside the tree)
  const { root, path_elements, path_index } = await tree.path(1);
 
  input.nullifierHash = input1.nullifierHash;  
  input.top = root;
  console.log("root", root);
  input.nullifier = input1.nullifier;
  input.secret = input1.secret;
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
