"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    console.log("Deploying TipPost...");
    const TipPost = await hardhat_1.ethers.getContractFactory("TipPost");
    const tipPost = await TipPost.deploy();
    await tipPost.waitForDeployment();
    const address = await tipPost.getAddress();
    console.log(`TipPost deployed to: ${address}`);
    console.log(`\nPaste this into your .env:`);
    console.log(`VITE_CONTRACT_ADDRESS=${address}`);
    console.log(`\nVerify on Etherscan:`);
    console.log(`npx hardhat verify --network sepolia ${address}`);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
