import "dotenv/config";
import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Seed fake profiles into the DirectoryV2 contract for testing
 *
 * Usage:
 *   bunx hardhat run scripts/seedProfiles.ts --network sepolia
 *
 * Env vars:
 *   SEED_COUNT - Number of profiles to create (default: 10)
 */

// Fake profile data generators
const NAMES = [
  "alex", "jordan", "taylor", "morgan", "casey", "riley", "quinn", "avery",
  "parker", "skyler", "sage", "phoenix", "river", "rowan", "emery", "finley",
  "harley", "logan", "cameron", "drew", "blake", "charlie", "jamie", "sam", "max"
];

// Gender identity: 0=hidden, 1=man, 2=woman, 3=trans man, 4=trans woman, 5=non-binary
const GENDERS = [1, 2, 3, 4, 5];

// Age buckets: 1=18-24, 2=25-29, 3=30-34, 4=35-39, 5=40-49, 6=50+
const AGE_BUCKETS = [1, 2, 3, 4, 5, 6];

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
  claimedAgeBucket: number;
  genderIdentity: number;
  modelVersion: number;
}

function generateFakeProfile(): Omit<FakeProfile, "wallet"> {
  return {
    animeCid: randomBytes32(), // Would be real IPFS CID in production
    encPhotoCid: randomBytes32(),
    claimedAgeBucket: randomElement(AGE_BUCKETS),
    genderIdentity: randomElement(GENDERS),
    modelVersion: 1,
  };
}

async function main() {
  const chainId = network.config.chainId ?? 11155111;
  const seedCount = Number(process.env.SEED_COUNT ?? 10);

  // Load deployment
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentPath = path.join(deploymentsDir, `${chainId}.json`);

  if (!fs.existsSync(deploymentPath)) {
    console.error(`Deployment file not found: ${deploymentPath}`);
    console.error("Run deployAll.ts first: bunx hardhat run scripts/deployAll.ts --network sepolia");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const directoryAddr = deployment.contracts.directory;

  console.log("=".repeat(60));
  console.log("Seeding Fake Profiles (DirectoryV2)");
  console.log("=".repeat(60));
  console.log(`Network: ${network.name} (chainId: ${chainId})`);
  console.log(`DirectoryV2: ${directoryAddr}`);
  console.log(`Profiles to create: ${seedCount}`);
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`\nDeployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);

  // Get DirectoryV2 contract
  const Directory = await ethers.getContractFactory("DirectoryV2");
  const directory = Directory.attach(directoryAddr);

  // Generate profiles
  const profiles: FakeProfile[] = [];
  for (let i = 0; i < seedCount; i++) {
    // Create deterministic wallet from seed for reproducibility
    const wallet = ethers.Wallet.createRandom();
    profiles.push({
      wallet,
      ...generateFakeProfile(),
    });
  }

  console.log(`\nCreating ${seedCount} profiles...`);

  const seeded: { name: string; address: string; gender: number; ageBucket: number }[] = [];

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const name = NAMES[i % NAMES.length];

    try {
      // Register profile (deployer calls on behalf of wallet via attestor)
      // In production, users would call this themselves
      const tx = await directory.createProfile(profile.wallet.address);
      await tx.wait();

      // Update profile with fake data
      const tx2 = await directory.connect(deployer).attestProfile(
        profile.wallet.address,
        profile.claimedAgeBucket, // Use claimed as attested for testing
        3 // verifiedLevel = passport (for testing)
      );
      await tx2.wait();

      seeded.push({
        name,
        address: profile.wallet.address,
        gender: profile.genderIdentity,
        ageBucket: profile.claimedAgeBucket,
      });

      console.log(`  [${i + 1}/${seedCount}] ${name}: ${profile.wallet.address.slice(0, 10)}... (gender=${profile.genderIdentity}, age=${profile.claimedAgeBucket})`);
    } catch (err: any) {
      console.error(`  [${i + 1}/${seedCount}] ${name}: FAILED - ${err.message}`);
    }
  }

  // Save seeded profiles
  const seedOutputPath = path.join(deploymentsDir, `${chainId}-seed.json`);
  fs.writeFileSync(seedOutputPath, JSON.stringify({ seeded, seedCount, timestamp: new Date().toISOString() }, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log(`Seeding Complete! Created ${seeded.length}/${seedCount} profiles`);
  console.log(`Output: ${seedOutputPath}`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
