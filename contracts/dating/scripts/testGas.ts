import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Get deployed contracts
  const datingAddr = "0x8BBc2C5c88a86395f97b7B4eEC2f4fe67c4C05c2";
  const directoryAddr = "0x3E2eb30EAbe9CBb4f3D0D30891537Eb3C14d4314";

  const Dating = await ethers.getContractFactory("Dating");
  const Directory = await ethers.getContractFactory("Directory");

  const dating = Dating.attach(datingAddr);
  const directory = Directory.attach(directoryAddr);

  console.log("Testing gas costs on Sepolia...\n");

  // Test 1: Register a profile (no FHE, just regular storage)
  console.log("1. Registering profile in Directory...");
  const profileTx = await directory.registerOrUpdateProfile(
    ethers.encodeBytes32String("QmAnimeAvatar123"), // animeCid
    ethers.encodeBytes32String("QmEncryptedPhoto1"), // encPhotoCid
    2, // ageBucket (25-29)
    1, // regionBucket
    1, // genderId
    2, // bodyBucket
    2, // fitnessBucket
    0, // smoking
    1, // drinking
    0, // kids
    0, // religion
    0, // relationshipStyle
    1, // lookingFor
    255, // visibilityFlags
    255, // matchRevealFlags
    1  // modelVersion
  );
  const profileReceipt = await profileTx.wait();
  console.log(`   Gas used: ${profileReceipt?.gasUsed}`);
  console.log(`   Tx: ${profileTx.hash}\n`);

  // For FHE operations, we need to use the fhevmjs library to encrypt
  // Let's check if we can at least call hasUserPrefs (view function)
  console.log("2. Checking hasUserPrefs (view, no gas)...");
  const hasPrefs = await dating.hasUserPrefs(deployer.address);
  console.log(`   Has prefs: ${hasPrefs}\n`);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Remaining balance: ${ethers.formatEther(balance)} ETH`);
}

main().catch(console.error);
