import { poseidonContract } from "circomlibjs";

// creates a contract factory for a poseidon hasher with nInputs inputs
export default function getPoseidonFactory(nInputs: number) {
    const bytecode = poseidonContract.createCode(nInputs);
    const abiJson = poseidonContract.generateABI(nInputs);
    const abi = new ethers.utils.Interface(abiJson);
    return new ethers.ContractFactory(abi, bytecode);
}