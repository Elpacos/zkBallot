const circomlib = require("circomlibjs");
const bigInt = require("big-integer");

let poseidon;

class PoseidonHasher {
  async hash(level, left, right) {
    poseidon = await circomlib.buildPoseidon()
    console.log(poseidon);
    //return circomlib.buildPoseidon([bigInt(left), bigInt(right)]);
  }
}

module.exports = PoseidonHasher;
