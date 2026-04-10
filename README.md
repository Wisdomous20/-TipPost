# TipPost — Pay-to-Like dApp

A decentralized social platform where users post images with captions and others
tip the creator with 0.0001 ETH per like.

## Live Deployment

- **Frontend:** <YOUR_VERCEL_URL>
- **Contract (Sepolia):** 0xECCFBB989985b64165d541ba50822E4380203995
- **Etherscan:** https://sepolia.etherscan.io/address/0xECCFBB989985b64165d541ba50822E4380203995

## Run Locally

npm install
npx hardhat compile
npx hardhat test
npm run dev

## Getting Sepolia ETH

- https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity ^0.8.20 |
| Dev Framework | Hardhat 2 + JavaScript |
| Frontend | React + Vite + TypeScript |
| Blockchain Lib | ethers.js v6 |
| Wallet | MetaMask |
| Network | Sepolia Testnet |
| Hosting | Vercel |