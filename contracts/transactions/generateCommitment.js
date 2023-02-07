const circomlib = require("circomlibjs");
const ffjavascript = require("ffjavascript");
const snarkjs = require("snarkjs");
const crypto = require("crypto");
const { secret, nullifier } = require("./exportRandomBytes");
const utils = ffjavascript.utils;
const stringifyBigInts = ffjavascript.utils.stringifyBigInts;
const { FIELD_SIZE } = require("../utils/constants/constants");

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
async function generateCommitment() {
  babyJub = await circomlib.buildBabyjub();
  pedersenAlg = await circomlib.buildPedersenHash();
  pedersenHash = (data) => babyJub.unpackPoint(pedersenAlg.hash(data))[0];
  poseidon = await circomlib.buildPoseidon();

  console.log("Data");
  console.log(secret, nullifier);
  const createdDeposit1 = createDeposit(secret, nullifier);

  input.nullifier = stringifyBigInts(
    utils.leBuff2int(createdDeposit1.nullifier)
  );
  input.nullifierHash = stringifyBigInts(
    F.fromRprLEM(createdDeposit1.nullifierHash)
  );
  input.deposit = createdDeposit1;
  input.commitment = createdDeposit1.commitment;
  input.secret = stringifyBigInts(utils.leBuff2int(createdDeposit1.secret));
  return input;
}

module.exports = { generateCommitment };

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
