#!/usr/bin/env bun
/**
 * Test Dating SetBasics v1 Lit Action
 *
 * Verifies:
 *  - Action builds valid setBasics() calldata
 *  - User PKP signs the transaction
 *  - Transaction can be broadcast (or dry run)
 *
 * Modes:
 *  - Default (--dry-run): Execute action but don't broadcast
 *  - --broadcast: Actually submit tx to Sepolia (requires user PKP to have gas)
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
const CONTRACT_ADDRESS = "0x1282fF4F33eFA67ea4f85E462F5D73e2cfF25b07";

// Gender constants from Dating.sol
const G_MAN = 1;
const G_WOMAN = 2;
const G_TRANS_MAN = 3;
const G_TRANS_WOMAN = 4;
const G_NON_BINARY = 5;

// Desired mask bits
const MASK_CIS_MEN = 0x0001;
const MASK_TRANS_MEN = 0x0002;
const MASK_CIS_WOMEN = 0x0004;
const MASK_TRANS_WOMEN = 0x0008;
const MASK_NON_BINARY = 0x0010;
const MASK_ALL_WOMEN = MASK_CIS_WOMEN | MASK_TRANS_WOMEN;
const MASK_EVERYONE = 0x001f;

async function main() {
  console.log("🧪 Test Dating SetBasics v1");
  console.log("=".repeat(60));
  console.log(`   Env:         ${Env.name}`);
  console.log(`   Chain ID:    ${CHAIN_ID}`);
  console.log(`   Contract:    ${CONTRACT_ADDRESS}`);
  console.log(`   Dry run:     ${DRY_RUN}`);

  const pkpCreds = Env.loadPkpCreds();
  console.log(`   PKP:         ${pkpCreds.ethAddress}`);
  console.log(`   Action CID:  ${Env.cids.datingSetbasics || "(not deployed)"}`);

  if (!Env.cids.datingSetbasics) {
    console.error("\n❌ No datingSetbasics action CID found. Run setup.ts first:");
    console.error("   bun run scripts/setup.ts upload dating-setbasics-v1");
    process.exit(1);
  }

  let pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not found in environment");
  if (!pk.startsWith("0x")) pk = "0x" + pk;

  const authEoa = privateKeyToAccount(pk as `0x${string}`);
  console.log(`   Auth EOA:    ${authEoa.address}`);

  // User PKP (same as master for test)
  const userPkpPublicKey = pkpCreds.publicKey;
  const userAddress = ethers.computeAddress(userPkpPublicKey);
  console.log(`   User PKP:    ${userAddress}`);

  // Check if user has gas (for broadcast mode)
  if (!DRY_RUN) {
    console.log("\n⚠️  Broadcast mode - checking user PKP balance...");
    const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_KEY || "public"}`);
    const balance = await provider.getBalance(userAddress);
    console.log(`   Balance:     ${ethers.formatEther(balance)} ETH`);
    if (balance === 0n) {
      console.error("\n❌ User PKP has no gas! Fund it first:");
      console.error(`   Address: ${userAddress}`);
      console.error("   Use a Sepolia faucet: https://sepoliafaucet.com/");
      process.exit(1);
    }
  }

  console.log("\n🔌 Connecting to Lit Protocol...");
  const litClient = await createLitClient({ network: Env.litNetwork });
  console.log("✅ Connected");

  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: "dating-setbasics-test",
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
  // For testing, we use placeholder bytes32 values
  //
  // WARNING: These are NOT real FHE ciphertexts and will fail on-chain
  // This test only validates the Lit Action logic, not the FHE contract interaction

  const mockAge = 25;
  const mockGenderId = G_WOMAN;
  const mockDesiredMask = MASK_ALL_WOMEN; // interested in women
  const mockShareAge = true;
  const mockShareGender = true;

  // Create mock "encrypted" values (just padded plaintext for structure testing)
  // Real values would be ~256+ bytes of FHE ciphertext
  const encAge = ethers.zeroPadValue(ethers.toBeHex(mockAge), 32);
  const encGenderId = ethers.zeroPadValue(ethers.toBeHex(mockGenderId), 32);
  const encDesiredMask = ethers.zeroPadValue(ethers.toBeHex(mockDesiredMask), 32);
  const encShareAge = ethers.zeroPadValue(ethers.toBeHex(mockShareAge ? 1 : 0), 32);
  const encShareGender = ethers.zeroPadValue(ethers.toBeHex(mockShareGender ? 1 : 0), 32);

  // Mock proof (would be Zama verification data in production)
  const proof = "0x";

  console.log("\n📦 Test profile values (MOCK - not real FHE):");
  console.log(`   Age:           ${mockAge}`);
  console.log(`   Gender ID:     ${mockGenderId} (woman)`);
  console.log(`   Desired mask:  0x${mockDesiredMask.toString(16)} (women)`);
  console.log(`   Share age:     ${mockShareAge}`);
  console.log(`   Share gender:  ${mockShareGender}`);

  const jsParams = {
    userPkpPublicKey,
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
      ipfsId: Env.cids.datingSetbasics,
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
    console.log(`   Contract:    ${response.contract}`);
    console.log(`   Chain ID:    ${response.chainId}`);

    // Verify user address
    if (response.user.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error(`User mismatch: expected ${userAddress}, got ${response.user}`);
    }
    console.log("   ✅ User address matches");

    if (DRY_RUN) {
      console.log(`\n   Dry run mode - transaction NOT broadcast`);
      console.log(`   Signed TX:   ${response.signedTx?.slice(0, 66)}...`);
      console.log(`   TX Hash:     ${response.txHash}`);

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
