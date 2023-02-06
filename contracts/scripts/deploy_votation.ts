const { ethers, upgrades } = require("hardhat");

const factoryAddress = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
async function main() {
  const [account, addr1] = await ethers.getSigners();
  const VotingFactory = await ethers.getContractFactory("VotingFactory");
  const factory = await VotingFactory.attach(factoryAddress);

  const deployVotation = await factory.createVotation(
    "test",
    "test de prueba porque me la pela y soy el mejor del mundoo ejjeej",
    ["verga", "webo", "pixa"],
    [account.address, addr1.address],
    "1672310325",
    "1672353525"
  );
  const receipt = await deployVotation.wait();
  console.log(
    receipt.events?.filter((x: any) => {
      return x.event == "VotingCreated";
    })[0].args
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
  });
