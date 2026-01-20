#!/usr/bin/env bun
/**
 * Test Dating SetBasics with REAL FHE encryption
 *
 * This test:
 * 1. Encrypts values using fhevmjs (real Zama FHE)
 * 2. Uses Lit Action to sign authorization and TX
 * 3. Broadcasts to Sepolia
 * 4. Verifies profile was initialized on-chain
 *
 * Usage:
 *   bun run tests/dating-setbasics-fhe.test.ts           # Dry run
 *   bun run tests/dating-setbasics-fhe.test.ts --broadcast  # Actually submit
 */

import { createLitClient } from "@lit-protocol/lit-client";
import { createAuthManager, storagePlugins, ViemAccountAuthenticator } from "@lit-protocol/auth";
import { privateKeyToAccount } from "viem/accounts";
import { Env } from "./shared/env";
import { ethers } from "ethers";
import { createInstance as createFhevmInstance } from "@zama-fhe/relayer-sdk/node";

const DRY_RUN = !process.argv.includes("--broadcast");
const CHAIN_ID = 11155111; // Sepolia
const CONTRACT_ADDRESS = "0xcAb2919b79D367988FB843420Cdd7665431AE0e7";
const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

// Zama Sepolia FHEVM configuration
const FHEVM_CONFIG = {
  aclContractAddress: "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D",
  kmsContractAddress: "0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A",
  inputVerifierContractAddress: "0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0",
  verifyingContractAddressDecryption: "0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478",
  verifyingContractAddressInputVerification: "0x483b9dE06E4E4C7D35CCf5837A1668487406D955",
  gatewayChainId: 10901,
  relayerUrl: "https://relayer.testnet.zama.org",
};

// Gender constants from Dating.sol
const G_WOMAN = 2;

// Desired mask bits
const MASK_CIS_WOMEN = 0x0004;
const MASK_TRANS_WOMEN = 0x0008;
const MASK_ALL_WOMEN = MASK_CIS_WOMEN | MASK_TRANS_WOMEN;

async function main() {
  console.log("🧪 Test Dating SetBasics with REAL FHE Encryption");
  console.log("=".repeat(60));
  console.log(`   Env:         ${Env.name}`);
  console.log(`   Chain ID:    ${CHAIN_ID}`);
  console.log(`   Contract:    ${CONTRACT_ADDRESS}`);
  console.log(`   Dry run:     ${DRY_RUN}`);

  const pkpCreds = Env.loadPkpCreds();
  console.log(`   Sponsor PKP: ${pkpCreds.ethAddress}`);
  console.log(`   Action CID:  ${Env.cids.datingSetbasicsSponsor || "(not deployed)"}`);

  if (!Env.cids.datingSetbasicsSponsor) {
    console.error("\n❌ No datingSetbasicsSponsor action CID found. Run setup.ts first:");
    console.error("   bun run scripts/setup.ts datingSetbasicsSponsor");
    process.exit(1);
  }

  let pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not found in environment");
  if (!pk.startsWith("0x")) pk = "0x" + pk;

  const authEoa = privateKeyToAccount(pk as `0x${string}`);
  console.log(`   Auth EOA:    ${authEoa.address}`);

  // User PKP = sponsor PKP for this test
  const userPkpPublicKey = pkpCreds.publicKey;
  const sponsorPkpPublicKey = pkpCreds.publicKey;
  const userAddress = ethers.computeAddress(userPkpPublicKey);
  console.log(`   User PKP:    ${userAddress}`);

  // Check sponsor has gas
  console.log("\n⚠️  Checking sponsor PKP balance...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const balance = await provider.getBalance(pkpCreds.ethAddress);
  console.log(`   Balance:     ${ethers.formatEther(balance)} ETH`);
  if (balance === 0n && !DRY_RUN) {
    console.error("\n❌ Sponsor PKP has no gas! Fund it first:");
    console.error(`   Address: ${pkpCreds.ethAddress}`);
    process.exit(1);
  }

  // Check if profile already initialized
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ["function profileInitialized(address) view returns (bool)"],
    provider
  );
  const alreadyInitialized = await contract.profileInitialized(userAddress);
  if (alreadyInitialized) {
    console.log(`\n⚠️  Profile already initialized for ${userAddress}`);
    console.log("   Skipping test - would need a fresh address to test again");
    process.exit(0);
  }

  // ============================================
  // STEP 1: Initialize fhevmjs and encrypt values
  // ============================================
  console.log("\n🔐 Initializing @zama-fhe/relayer-sdk for REAL FHE encryption...");

  const fhevmInstance = await createFhevmInstance({
    chainId: CHAIN_ID,
    network: RPC_URL,
    ...FHEVM_CONFIG,
  });

  console.log("✅ fhevmjs initialized");

  const age = 25;
  const genderId = G_WOMAN;
  const desiredMask = MASK_ALL_WOMEN;
  const shareAge = true;
  const shareGender = true;

  console.log("\n📦 Profile values:");
  console.log(`   Age:           ${age}`);
  console.log(`   Gender ID:     ${genderId} (woman)`);
  console.log(`   Desired mask:  0x${desiredMask.toString(16)} (women)`);
  console.log(`   Share age:     ${shareAge}`);
  console.log(`   Share gender:  ${shareGender}`);

  console.log("\n🔐 Encrypting with Zama FHE...");

  // Create encrypted input - new SDK uses BigInt
  const input = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, userAddress);
  input.add8(BigInt(age));            // euint8 for age
  input.add8(BigInt(genderId));       // euint8 for genderId
  input.add16(BigInt(desiredMask));   // euint16 for desiredMask
  input.addBool(shareAge);            // ebool for shareAge
  input.addBool(shareGender);         // ebool for shareGender

  console.log("   Calling encrypt() - this contacts the Zama relayer...");
  const encrypted = await input.encrypt();

  // New SDK returns handles as Uint8Arrays and inputProof
  const handles = encrypted.handles;
  const proof = encrypted.inputProof;

  console.log(`   Received ${handles.length} handles`);

  // Convert Uint8Array handles to bytes32 hex strings
  const toHex = (arr: Uint8Array | string) => {
    if (typeof arr === 'string') return arr;
    return ethers.hexlify(arr);
  };

  const encAge = toHex(handles[0]);
  const encGenderId = toHex(handles[1]);
  const encDesiredMask = toHex(handles[2]);
  const encShareAge = toHex(handles[3]);
  const encShareGender = toHex(handles[4]);
  const proofHex = typeof proof === 'string' ? proof : ethers.hexlify(proof);

  console.log(`   encAge:          ${encAge.slice(0, 20)}...`);
  console.log(`   encGenderId:     ${encGenderId.slice(0, 20)}...`);
  console.log(`   encDesiredMask:  ${encDesiredMask.slice(0, 20)}...`);
  console.log(`   encShareAge:     ${encShareAge.slice(0, 20)}...`);
  console.log(`   encShareGender:  ${encShareGender.slice(0, 20)}...`);
  console.log(`   proof:           ${proofHex.slice(0, 20)}...`);

  // ============================================
  // STEP 2: Connect to Lit and execute action
  // ============================================
  console.log("\n🔌 Connecting to Lit Protocol...");
  const litClient = await createLitClient({ network: Env.litNetwork });
  console.log("✅ Connected");

  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: "dating-setbasics-fhe-test",
      networkName: Env.name,
      storagePath: "./output/lit-auth",
    }),
  });

  console.log("\n🔑 Authenticating EOA...");
  const authData = await ViemAccountAuthenticator.authenticate(authEoa);
  console.log("✅ Auth data created");

  console.log("\n📝 Creating PKP auth context...");
  const authContext = await authManager.createPkpAuthContext({
    authData,
    pkpPublicKey: pkpCreds.publicKey,
    authConfig: {
      resources: [
        ["pkp-signing", "*"],
        ["lit-action-execution", "*"],
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      statement: "",
    },
    litClient,
  });
  console.log("✅ Auth context ready");

  const jsParams = {
    userPkpPublicKey,
    sponsorPkpPublicKey,
    encAge,
    encGenderId,
    encDesiredMask,
    encShareAge,
    encShareGender,
    proof: proofHex,
    dryRun: DRY_RUN,
    chainId: CHAIN_ID,
    contractAddress: CONTRACT_ADDRESS,
  };

  console.log("\n🚀 Executing Lit Action...");

  try {
    const result = await litClient.executeJs({
      ipfsId: Env.cids.datingSetbasicsSponsor,
      authContext,
      jsParams,
    });

    console.log("✅ Lit Action executed");

    const response =
      typeof result.response === "string" ? JSON.parse(result.response) : result.response;

    console.log("\n📦 Action response:");
    console.log(JSON.stringify(response, null, 2));

    if (!response?.success) {
      throw new Error(response?.error || "action returned success=false");
    }

    console.log("\n✅ SUCCESS!");
    console.log(`   Version:     ${response.version}`);
    console.log(`   User:        ${response.user}`);
    console.log(`   Sponsor:     ${response.sponsor}`);
    console.log(`   Contract:    ${response.contract}`);
    console.log(`   Chain ID:    ${response.chainId}`);

    if (DRY_RUN) {
      console.log(`\n   🔍 Dry run mode - transaction NOT broadcast`);
      console.log(`   Signed TX:   ${response.signedTx?.slice(0, 66)}...`);
      console.log(`   TX Hash:     ${response.txHash}`);

      // Decode to verify
      const tx = ethers.Transaction.from(response.signedTx);
      console.log(`\n   Decoded TX:`);
      console.log(`     To:        ${tx.to}`);
      console.log(`     Chain:     ${tx.chainId}`);
      console.log(`     Data len:  ${tx.data?.length} chars`);

    } else {
      console.log(`\n   🎉 Transaction broadcast!`);
      console.log(`   TX Hash: ${response.txHash}`);
      console.log(`   View:    https://sepolia.etherscan.io/tx/${response.txHash}`);

      // Wait for confirmation
      console.log("\n   ⏳ Waiting for confirmation...");
      const receipt = await provider.waitForTransaction(response.txHash, 1, 120000);

      if (receipt?.status === 1) {
        console.log("   ✅ Transaction confirmed!");
        console.log(`   Gas used: ${receipt.gasUsed}`);

        // Verify profile was initialized
        const initialized = await contract.profileInitialized(userAddress);
        console.log(`   profileInitialized[user]: ${initialized}`);

        if (initialized) {
          console.log("\n🎉 REAL FHE PROFILE CREATION SUCCEEDED!");
        } else {
          console.log("\n⚠️  TX confirmed but profile not initialized - check contract logic");
        }
      } else {
        console.log("   ❌ Transaction reverted");
        console.log(`   Status: ${receipt?.status}`);
      }
    }

  } catch (error: any) {
    console.error("\n❌ Execution failed:", error.message);
    if (error.cause) console.error("   Cause:", error.cause);
    process.exit(1);
  }

  await litClient.disconnect();
}

main().catch((e) => {
  console.error("\n❌ FAIL:", e?.message || e);
  process.exit(1);
});
