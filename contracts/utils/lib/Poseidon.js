const circomlib = require("circomlibjs");

class PoseidonHasher {
  constructor(poseidon) {
    this.poseidon = poseidon;
  }
  hash(level, left, right) {
    const h = this.poseidon([BigInt(left), BigInt(right)]);
    const hexString = this.poseidon.F.toString(h, 16);
    return "0x" + padHexString(hexString);
  }
}

function padHexString(hexString) {
  if (hexString.length % 2 == 1) {
    hexString = "0" + hexString;
  }
  return hexString;
}

module.exports = PoseidonHasher;
