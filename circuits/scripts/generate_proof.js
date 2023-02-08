const snarkjs = require("snarkjs");
const lib = require("./generate_input");

async function main() {
  const input = await lib.generateWitness();
  console.log("js nullifier", input.nullifierHash);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "./ballot_js/ballot.wasm",
    "./circuit_0002.zkey"
  );

  const vkey = require("../verification_key.json");

  const res = await snarkjs.groth16.verify(vkey, publicSignals, proof, console);
  console.log(res);
}

main().then(() => {
  process.exit(0);
});
