import { poseidonContract, buildPoseidon } from "circomlibjs";
const { ethers, upgrades } = require("hardhat");
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";

function getPoseidonFactory(nInputs: number) {
  const bytecode = poseidonContract.createCode(nInputs);
  const abiJson = poseidonContract.generateABI(nInputs);
  const abi = new ethers.utils.Interface(abiJson);
  return new ethers.ContractFactory(abi, bytecode);
}

async function main() {
  //let provider = ethers.getDefaultProvider("http://localhost:8545");

  await setBalance("0x8041c435473FD8657fFaEAd13c3447D3DAca0635", 100);
  await setBalance("0x57E16B16F296ac76B69d22e477A77749197bB968", 100);

  const [account, addr1] = await ethers.getSigners();
  const poseidonContract = await getPoseidonFactory(2)
    .connect(account)
    .deploy();
  await poseidonContract.deployed();
  console.log("Hasher library was deployed to: ", poseidonContract.address);
  const res = await poseidonContract["poseidon(uint256[2])"]([1, 2]);
  //TODO: que porongas es esto?
  console.log(res);

  //####### Deploy verifier contract ######
  const Verifier = await ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();

  console.log("Verifier contract deployed to: ", verifier.address);

  const VotingFactory = await ethers.getContractFactory("VotingFactory");
  const votingFactory = await upgrades.deployProxy(
    VotingFactory,
    [verifier.address, poseidonContract.address],
    {
      initializer: "initialize",
    }
  );
  await votingFactory.deployed();
  console.log("VotingFactory deployed to:", votingFactory.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
