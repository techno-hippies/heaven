#!/usr/bin/env npx ts-node
/**
 * Deploy DatingV3 with setBasicsFor support
 *
 * Usage: npx hardhat run scripts/deploy-dating-v3.ts --network sepolia
 */

import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying DatingV3 with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Use existing Directory address from previous deployment
  // Or deployer if no directory needed for testing
  const directoryAddress = process.env.DIRECTORY_ADDRESS || deployer.address;

  // Roles
  const admin = deployer.address;
  const oracle = process.env.ORACLE_ADDRESS || deployer.address;
  const relayer = process.env.RELAYER_ADDRESS || deployer.address;

  console.log("\nDeployment parameters:");
  console.log("  admin:", admin);
  console.log("  directory:", directoryAddress);
  console.log("  oracle:", oracle);
  console.log("  relayer:", relayer);
  console.log("  (setBasicsSponsor will default to relayer)");

  // Deploy
  const DatingV3 = await ethers.getContractFactory("DatingV3");
  const dating = await DatingV3.deploy(admin, directoryAddress, oracle, relayer);
  await dating.waitForDeployment();

  const address = await dating.getAddress();
  console.log("\n✅ DatingV3 deployed to:", address);

  // Verify setBasicsSponsor is set
  const sponsor = await dating.setBasicsSponsor();
  console.log("  setBasicsSponsor:", sponsor);

  // Log for .env update
  console.log("\n📋 Update your .env:");
  console.log(`VITE_DATING_ADDRESS=${address}`);
  console.log(`\n📋 Update Lit Action DEFAULT_CONTRACT_ADDRESS:`);
  console.log(`const DEFAULT_CONTRACT_ADDRESS = "${address}";`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
