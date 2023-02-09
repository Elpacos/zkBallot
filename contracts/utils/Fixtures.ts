import getPoseidonFactory from "../utils/PoseidonFactory";

/**
  * @notice Deploys the BallotFactory & contracts needed for the tests
  * @return the contract objects of the deployed contracts and the signers
  * @dev the contracts are deployed in the following order:
  * 1. Poseidon hasher lib
  * 2. Verifier contract
  * 3. BallotFactory
*/
export async function deployFactoryFixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  // Deploy Poseidon Hasher
  const poseidonContract = await getPoseidonFactory(2).connect(owner).deploy();
  //console.log("Hasher library was deployed to: ", poseidonContract.address);

  // Deploy Verifier
  const Verifier = await ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  //console.log("Verifier contract deployed to: ", verifier.address);

  // Deploy VotingFactory through a UUPS proxy
  const BallotFactory = await ethers.getContractFactory("BallotFactory");
  const ballotFactory = await upgrades.deployProxy(
    BallotFactory,
    [verifier.address, poseidonContract.address],
    {
      initializer: "initialize",
    }
  );
  //console.log("BallotFactory deployed to:", ballotFactory.address);

  return { owner, addr1, addr2, ballotFactory, verifier, poseidonContract };
}

/**
  * @notice Deploys the NFTMock contract and mints NFTs to the addresses in the whitelist
  * @param whitelist the addresses to mint NFTs to
  * @return the contract object of the deployed NFTMock contract and the whitelist
 */
export async function deployAndMintNFTMock(whitelist: any[]) {

  // Deploy the NFT contract
  const NFT = await ethers.getContractFactory("NFTMock");
  const NFTContract = await NFT.deploy("NFTMock", "NFTMock");
  await NFTContract.deployed();
  //console.log("NFT contract deployed to: ", NFTContract.address);

  // Mint NFTs
  for (let i = 0; i < whitelist.length; i++) {
    await NFTContract.mint(whitelist[i], "");
    //console.log("Minted NFT to address: ", whitelist[i]);
  }

  return { whitelist, NFTContract };
}

/**
 * @returns current timestamp in seconds
**/
export function getTimeNow() {
  const now = (new Date().getTime() / 1000);
  const nowInt = Math.floor(now);
  return nowInt;
}