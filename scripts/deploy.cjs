const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TipPost...");
  const TipPost = await ethers.getContractFactory("TipPost");
  const tipPost = await TipPost.deploy();
  await tipPost.waitForDeployment();

  const address = await tipPost.getAddress();
  console.log("TipPost deployed to:", address);
  console.log("VITE_CONTRACT_ADDRESS=" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});