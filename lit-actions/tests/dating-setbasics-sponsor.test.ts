#!/usr/bin/env bun
/**
 * Test Dating SetBasics Sponsor v1 Lit Action
 *
 * Verifies:
 *  - User PKP signs EIP-712 authorization
 *  - Sponsor PKP signs and broadcasts TX
 *  - Contract verifies signature and updates profile
 *
 * Modes:
 *  - Default (--dry-run): Execute action but don't broadcast
 *  - --broadcast: Actually submit tx to Sepolia
 *
 * Note: This test uses MOCK FHE values (not real Zama encryption).
 * Real usage requires client-side encryption with Zama SDK.
 */

import { createLitClient } from "@lit-protocol/lit-client";
import { createAuthManager, storagePlugins, ViemAccountAuthenticator } from "@lit-protocol/auth";
import { privateKeyToAccount } from "viem/accounts";
import { Env } from "./shared/env";
import { ethers } from "ethers";

const DRY_RUN = !process.argv.includes("--broadcast");
const CHAIN_ID = 11155111; // Sepolia
const CONTRACT_ADDRESS = "0xcAb2919b79D367988FB843420Cdd7665431AE0e7";

// Gender constants from Dating.sol
const G_WOMAN = 2;

// Desired mask bits
const MASK_CIS_WOMEN = 0x0004;
const MASK_TRANS_WOMEN = 0x0008;
const MASK_ALL_WOMEN = MASK_CIS_WOMEN | MASK_TRANS_WOMEN;

async function main() {
  console.log("🧪 Test Dating SetBasics Sponsor v1");
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

  // For this test, user PKP = sponsor PKP (same PKP signs auth and pays gas)
  // In production, these would typically be different
  const userPkpPublicKey = pkpCreds.publicKey;
  const sponsorPkpPublicKey = pkpCreds.publicKey;
  const userAddress = ethers.computeAddress(userPkpPublicKey);
  console.log(`   User PKP:    ${userAddress}`);

  // Check sponsor has gas
  console.log("\n⚠️  Checking sponsor PKP balance...");
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
  const balance = await provider.getBalance(pkpCreds.ethAddress);
  console.log(`   Balance:     ${ethers.formatEther(balance)} ETH`);
  if (balance === 0n && !DRY_RUN) {
    console.error("\n❌ Sponsor PKP has no gas! Fund it first:");
    console.error(`   Address: ${pkpCreds.ethAddress}`);
    process.exit(1);
  }

  console.log("\n🔌 Connecting to Lit Protocol...");
  const litClient = await createLitClient({ network: Env.litNetwork });
  console.log("✅ Connected");

  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: "dating-setbasics-sponsor-test",
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

  // Build MOCK FHE-encrypted values
  // In production, these would be encrypted client-side with Zama SDK
  const mockAge = 25;
  const mockGenderId = G_WOMAN;
  const mockDesiredMask = MASK_ALL_WOMEN;
  const mockShareAge = true;
  const mockShareGender = true;

  // Create mock "encrypted" values (just padded plaintext for structure testing)
  const encAge = ethers.zeroPadValue(ethers.toBeHex(mockAge), 32);
  const encGenderId = ethers.zeroPadValue(ethers.toBeHex(mockGenderId), 32);
  const encDesiredMask = ethers.zeroPadValue(ethers.toBeHex(mockDesiredMask), 32);
  const encShareAge = ethers.zeroPadValue(ethers.toBeHex(mockShareAge ? 1 : 0), 32);
  const encShareGender = ethers.zeroPadValue(ethers.toBeHex(mockShareGender ? 1 : 0), 32);

  // Mock proof
  const proof = "0x";

  console.log("\n📦 Test profile values (MOCK - not real FHE):");
  console.log(`   Age:           ${mockAge}`);
  console.log(`   Gender ID:     ${mockGenderId} (woman)`);
  console.log(`   Desired mask:  0x${mockDesiredMask.toString(16)} (women)`);
  console.log(`   Share age:     ${mockShareAge}`);
  console.log(`   Share gender:  ${mockShareGender}`);

  const jsParams = {
    userPkpPublicKey,
    sponsorPkpPublicKey,
    encAge,
    encGenderId,
    encDesiredMask,
    encShareAge,
    encShareGender,
    proof,
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
    console.log(`   User Nonce:  ${response.userNonce}`);
    console.log(`   Deadline:    ${response.deadline}`);

    // Verify addresses
    if (response.user.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error(`User mismatch: expected ${userAddress}, got ${response.user}`);
    }
    console.log("   ✅ User address matches");

    if (response.sponsor.toLowerCase() !== pkpCreds.ethAddress.toLowerCase()) {
      throw new Error(`Sponsor mismatch: expected ${pkpCreds.ethAddress}, got ${response.sponsor}`);
    }
    console.log("   ✅ Sponsor address matches");

    if (DRY_RUN) {
      console.log(`\n   Dry run mode - transaction NOT broadcast`);
      console.log(`   Signed TX:   ${response.signedTx?.slice(0, 66)}...`);
      console.log(`   TX Hash:     ${response.txHash}`);
      console.log(`   Data Hash:   ${response.dataHash}`);
      console.log(`   Digest:      ${response.digest}`);

      // Decode the signed TX to verify it's valid
      const tx = ethers.Transaction.from(response.signedTx);
      console.log(`\n   Decoded TX:`);
      console.log(`     To:        ${tx.to}`);
      console.log(`     Chain:     ${tx.chainId}`);
      console.log(`     Nonce:     ${tx.nonce}`);
      console.log(`     Gas limit: ${tx.gasLimit}`);
      console.log(`     Data:      ${tx.data?.slice(0, 66)}...`);

      if (tx.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
        throw new Error(`TX 'to' mismatch: expected ${CONTRACT_ADDRESS}`);
      }
      console.log("   ✅ TX target contract valid");

    } else {
      console.log(`\n   🎉 Transaction broadcast!`);
      console.log(`   TX Hash: ${response.txHash}`);
      console.log(`   View:    https://sepolia.etherscan.io/tx/${response.txHash}`);
      console.log(`\n   ⚠️  Note: TX will likely FAIL on-chain because we used mock FHE values`);

      // Check if profile was initialized (may fail with mock values)
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ["function profileInitialized(address) view returns (bool)"],
        provider
      );

      // Wait a bit for the tx to be mined
      console.log("\n   Waiting for confirmation...");
      await new Promise(resolve => setTimeout(resolve, 15000));

      try {
        const initialized = await contract.profileInitialized(userAddress);
        console.log(`   profileInitialized[user]: ${initialized}`);
      } catch (e) {
        console.log(`   Could not check profileInitialized: ${(e as Error).message}`);
      }
    }

    console.log("\n🎉 All checks passed!");

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
