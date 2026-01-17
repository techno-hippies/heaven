import "dotenv/config";
import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Seed fake profiles into the Directory contract for testing
 *
 * Usage:
 *   npx hardhat run scripts/seedProfiles.ts --network fhevm
 *
 * Env vars:
 *   SEED_COUNT - Number of profiles to create (default: 25)
 */

// Fake profile data generators
const NAMES = [
  "alex", "jordan", "taylor", "morgan", "casey", "riley", "quinn", "avery",
  "parker", "skyler", "sage", "phoenix", "river", "rowan", "emery", "finley",
  "harley", "logan", "cameron", "drew", "blake", "charlie", "jamie", "sam", "max"
];

const REGIONS = [1, 2, 3, 4, 5, 6, 7, 8]; // 1=NA, 2=LATAM, 3=Europe, etc.
const GENDERS = [1, 2, 3, 4, 5]; // 1=man, 2=woman, 3=non-binary, etc.
const BODY_TYPES = [1, 2, 3, 4, 5];
const FITNESS_LEVELS = [1, 2, 3, 4, 5];
const SMOKING = [0, 1, 2, 3]; // 0=hidden, 1=never, 2=sometimes, 3=regularly
const DRINKING = [0, 1, 2, 3];
const LOOKING_FOR = [0, 1, 2, 3]; // 0=hidden, 1=low-commitment, 2=friends-first, 3=relationship

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBytes32(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}

interface FakeProfile {
  wallet: ethers.Wallet;
  animeCid: string;
  encPhotoCid: string;
  regionBucket: number;
  genderIdentity: number;
  bodyBucket: number;
  fitnessBucket: number;
  smoking: number;
  drinking: number;
  lookingFor: number;
  modelVersion: number;
}

function generateFakeProfile(index: number): Omit<FakeProfile, "wallet"> {
  return {
    animeCid: randomBytes32(), // Would be real IPFS CID in production
    encPhotoCid: randomBytes32(),
    regionBucket: randomElement(REGIONS),
    genderIdentity: randomElement(GENDERS),
    bodyBucket: randomElement(BODY_TYPES),
    fitnessBucket: randomElement(FITNESS_LEVELS),
    smoking: randomElement(SMOKING),
    drinking: randomElement(DRINKING),
    lookingFor: randomElement(LOOKING_FOR),
    modelVersion: 1,
  };
}

async function main() {
  const chainId = network.config.chainId ?? 11155111;
  const seedCount = Number(process.env.SEED_COUNT ?? 25);

  // Load deployment
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentPath = path.join(deploymentsDir, `${chainId}.json`);

  if (!fs.existsSync(deploymentPath)) {
    console.error(`Deployment file not found: ${deploymentPath}`);
    console.error("Run deployAll.ts first: npx hardhat run scripts/deployAll.ts --network fhevm");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const directoryAddr = deployment.contracts.directory;

  console.log("=".repeat(60));
  console.log("Seed Profiles");
  console.log("=".repeat(60));
  console.log(`Network: ${network.name} (chainId: ${chainId})`);
  console.log(`Directory: ${directoryAddr}`);
  console.log(`Seed count: ${seedCount}`);
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log(`\nDeployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(deployerBalance)} ETH`);

  // Get Directory contract
  const Directory = await ethers.getContractFactory("Directory");
  const directory = Directory.attach(directoryAddr);

  // Generate and register profiles
  const profiles: Array<{ address: string; name: string }> = [];
  const fundAmount = ethers.parseEther("0.001"); // Fund each wallet with 0.001 ETH (enough for 1 tx)

  console.log(`\nCreating ${seedCount} profiles...`);

  for (let i = 0; i < seedCount; i++) {
    const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? Math.floor(i / NAMES.length) : "");
    const profile = generateFakeProfile(i);

    // Create random wallet
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

    // Fund wallet
    console.log(`\n[${i + 1}/${seedCount}] ${name} (${wallet.address.slice(0, 10)}...)`);
    console.log(`  Funding with ${ethers.formatEther(fundAmount)} ETH...`);

    const fundTx = await deployer.sendTransaction({
      to: wallet.address,
      value: fundAmount,
    });
    await fundTx.wait();

    // Register profile
    console.log(`  Registering profile...`);
    const tx = await directory.connect(wallet).registerOrUpdateProfile(
      profile.animeCid,
      profile.encPhotoCid,
      profile.regionBucket,
      profile.genderIdentity,
      profile.bodyBucket,
      profile.fitnessBucket,
      profile.smoking,
      profile.drinking,
      profile.lookingFor,
      profile.modelVersion
    );
    await tx.wait();

    profiles.push({ address: wallet.address, name });
    console.log(`  Done!`);
  }

  // Save seeded profiles
  const seedPath = path.join(deploymentsDir, `${chainId}-seed.json`);
  fs.writeFileSync(
    seedPath,
    JSON.stringify(
      {
        chainId,
        directory: directoryAddr,
        seededAt: new Date().toISOString(),
        count: profiles.length,
        profiles,
      },
      null,
      2
    )
  );

  console.log("\n" + "=".repeat(60));
  console.log("Seeding Complete!");
  console.log("=".repeat(60));
  console.log(`\nCreated ${profiles.length} profiles`);
  console.log(`Seed data saved to: ${seedPath}`);

  // Verify count
  const totalProfiles = await directory.getProfileCount();
  console.log(`\nDirectory now has ${totalProfiles} total profiles`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
