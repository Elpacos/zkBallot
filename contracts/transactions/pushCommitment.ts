const { ethers, upgrades } = require("hardhat");
const { generateCommitment } = require("./generateCommitment");

const votingContractAddress = "0x2067fe8E88780092BEf4670450b4663321A7160D";

async function main() {
  const [account, addr1] = await ethers.getSigners();
  const Voting = await ethers.getContractFactory("Votation");
  const voting = await Voting.attach(votingContractAddress);

  const optionList = await voting.choicesList();
  console.log("The options are", optionList);

  const hasEnded = await voting.hasEnded();
  console.log("Has ended?", hasEnded);

  const hasStarted = await voting.hasStarted();
  console.log("Has started?", hasStarted);

  const input = await generateCommitment("12345", "56789");
  console.log("Commitment", input.commitment);
  console.log("Commitment length", input.commitment.length);

  const pushCommitment = await voting.signUp(input.commitment, {
    gasLimit: 2e6,
  });
  console.log("Indice", pushCommitment);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
