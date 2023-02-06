const snarkjs = require("snarkjs");
const fs = require("fs");
const lib = require("./generate_input");

async function main() {
  const input = await lib.generateWitness();
  console.log(input);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "./votation_js/votation.wasm",
    "./circuit_0002.zkey"
  );

  const vkey = require("../verification_key.json");

  const res = await snarkjs.groth16.verify(vkey, publicSignals, proof, console);
  console.log(res);
}

main().then(() => {
  process.exit(0);
});
