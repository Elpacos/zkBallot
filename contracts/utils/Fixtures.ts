import getPoseidonFactory from "../utils/PoseidonFactory";

export default async function deployFactoryFixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  // Deploy Poseidon
  const poseidonContract = await getPoseidonFactory(2).connect(owner).deploy();
  console.log("Hasher library was deployed to: ", poseidonContract.address);

  // Deploy Verifier
  const Verifier = await ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  console.log("Verifier contract deployed to: ", verifier.address);

  // Deploy VotingFactory
  const VotingFactory = await ethers.getContractFactory("VotingFactory");
  const votingFactory = await upgrades.deployProxy(
    VotingFactory,
    [verifier.address, poseidonContract.address],
    {
      initializer: "initialize",
    }
  );
  console.log("VotingFactory deployed to:", votingFactory.address);

  return { owner, addr1, addr2, votingFactory, verifier, poseidonContract };
}
