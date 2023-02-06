const ffjavascript = require("ffjavascript");
const { secret, nullifier } = require("../transactions/exportRandomBytes");

class PoseidonHasher {
  hash(level, left, right) {
    const h = poseidon([BigInt(left), BigInt(right)]);
    const parserdhash = poseidon.F.toString(h, 16);
    return "0x" + parserdhash;
  }
}

describe("MerkleTree poseidon Hasher", function () {
  it("Should generate the same hashes", async function () {
    console.log("Data 2");
    console.log(secret, nullifier);
  });
});
