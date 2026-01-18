import "dotenv/config";
import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Deploy all Neodate contracts to Sepolia (Zama fhEVM via coprocessor)
 *
 * Usage:
 *   bun run deploy
 *   # or: bunx hardhat run scripts/deployAll.ts --network sepolia
 *
 * Output:
 *   deployments/<chainId>.json with all contract addresses
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const admin = deployer.address;
  const chainId = network.config.chainId ?? 11155111;

  console.log("=".repeat(60));
  console.log("Neodate Contract Deployment");
  console.log("=".repeat(60));
  console.log(`Network: ${network.name} (chainId: ${chainId})`);
  console.log(`Deployer: ${admin}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(admin))} ETH`);
  console.log("=".repeat(60));

  // Roles (all deployer for now)
  const oracle = process.env.ORACLE_ADDRESS ?? admin;
  const relayer = process.env.RELAYER_ADDRESS ?? admin;
  const attestor = admin;

  console.log("\nRoles:");
  console.log(`  Admin: ${admin}`);
  console.log(`  Oracle: ${oracle}`);
  console.log(`  Relayer: ${relayer}`);
  console.log(`  Attestor: ${attestor}`);

  // 1. Deploy DirectoryV2
  console.log("\n[1/3] Deploying DirectoryV2...");
  const Directory = await ethers.getContractFactory("DirectoryV2");
  const directory = await Directory.deploy(admin, attestor);
  await directory.waitForDeployment();
  const directoryAddr = await directory.getAddress();
  console.log(`  DirectoryV2: ${directoryAddr}`);

  // 2. Deploy DatingV3 (depends on DirectoryV2)
  console.log("\n[2/3] Deploying DatingV3...");
  const Dating = await ethers.getContractFactory("DatingV3");
  const dating = await Dating.deploy(admin, directoryAddr, oracle, relayer);
  await dating.waitForDeployment();
  const datingAddr = await dating.getAddress();
  console.log(`  DatingV3: ${datingAddr}`);

  // 3. Deploy PartnerLink (independent)
  console.log("\n[3/3] Deploying PartnerLink...");
  const PartnerLink = await ethers.getContractFactory("PartnerLink");
  const partnerLink = await PartnerLink.deploy();
  await partnerLink.waitForDeployment();
  const partnerLinkAddr = await partnerLink.getAddress();
  console.log(`  PartnerLink: ${partnerLinkAddr}`);

  // Write deployment output
  const deployment = {
    chainId,
    network: network.name,
    deployer: admin,
    deployedAt: new Date().toISOString(),
    contracts: {
      directory: directoryAddr,
      dating: datingAddr,
      partnerLink: partnerLinkAddr,
    },
    roles: {
      admin,
      oracle,
      relayer,
      attestor,
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });

  const outputPath = path.join(deploymentsDir, `${chainId}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(deployment, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log("Deployment Complete!");
  console.log("=".repeat(60));
  console.log(`\nOutput written to: ${outputPath}`);
  console.log("\nContract Addresses:");
  console.log(`  DirectoryV2: ${directoryAddr}`);
  console.log(`  DatingV3:    ${datingAddr}`);
  console.log(`  PartnerLink: ${partnerLinkAddr}`);
  console.log("\nNext steps:");
  console.log("  1. Update app/.env with contract addresses");
  console.log("  2. Run seed script: bun run seed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
