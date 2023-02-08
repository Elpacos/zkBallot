const circomlib = require("circomlibjs");
const ffjavascript = require("ffjavascript");
const snarkjs = require("snarkjs");
const crypto = require("crypto");
const { secret, nullifier } = require("./exportRandomBytes");
const utils = ffjavascript.utils;
const stringifyBigInts = ffjavascript.utils.stringifyBigInts;
const { FIELD_SIZE } = require("../../utils/constants/constants.js");

class PoseidonHasher {
  hash(level, left, right) {
    const h = poseidon([BigInt(left), BigInt(right)]);
    const parsedhash = poseidon.F.toString(h, 16);
    return "0x" + parsedhash;
  }
}

let poseidon;
let input = {};


function genRandomNumber(byteCount, radix) {
  return BigInt('0x' + crypto.randomBytes(byteCount).toString('hex')).toString(radix)
}

// to genrate a 8 byte number in decimal format string

const F = new ffjavascript.ZqField(ffjavascript.Scalar.fromString(FIELD_SIZE));
async function generateCommitment() {
  // build circomlib objects
  // generate random bytes
  const secret = genRandomNumber(8, 10);
  const nullifier = genRandomNumber(8, 10);

  poseidon = await circomlib.buildPoseidon();
  const nullifierHash = "0x" + padHexString(poseidon.F.toString(poseidon([nullifier]), 16));
  const commitment = "0x" + padHexString(poseidon.F.toString(poseidon([nullifier, secret]), 16));

  // create input object
  input.nullifier = nullifier
  input.secret = secret
  input.nullifierHash = nullifierHash
  input.commitment = commitment;

  return input;
}

function padHexString(hexString) {
  if (hexString.length % 2 == 1) {
    hexString = "0" + hexString;
  }
  return hexString;
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

/* function createDeposit(nullifier, secret) {
  let deposit = { nullifier, secret };
  const h = poseidon([deposit.nullifier, deposit.secret]);
  
  deposit.commitment = "0x" + hexString;

  deposit.nullifierHash = poseidon([deposit.nullifier]);
  return deposit;
} */