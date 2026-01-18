import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { readFileSync } from "fs";

// Load compiled artifact
const artifact = JSON.parse(readFileSync("./artifacts/contracts/SurveyRegistry.sol/SurveyRegistry.json", "utf-8"));

// Get private key
let pk = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
if (!pk) throw new Error("No DEPLOYER_PRIVATE_KEY or PRIVATE_KEY found");
if (!pk.startsWith("0x")) pk = "0x" + pk;

const account = privateKeyToAccount(pk as `0x${string}`);
console.log("Deployer:", account.address);

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

async function main() {
  console.log("Deploying SurveyRegistry to Base Sepolia...");

  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [],
  });
  console.log("Deploy tx hash:", hash);

  console.log("Waiting for confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Contract deployed at:", receipt.contractAddress);
  console.log("Status:", receipt.status);

  // Update the .env suggestion
  console.log("\n📝 Update these values:");
  console.log(`   VITE_SURVEY_REGISTRY_ADDRESS=${receipt.contractAddress}`);
  console.log(`   (in app/.env and lit-actions/.env)`);
}

main().catch(console.error);
