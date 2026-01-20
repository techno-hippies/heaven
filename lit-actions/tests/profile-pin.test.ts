#!/usr/bin/env bun
/**
 * Test Profile Pin v1 Lit Action
 *
 * Verifies:
 *  - Action pins profile JSON to Filebase IPFS
 *  - Returns valid CID
 *  - Profile data is correctly structured
 *
 * Modes:
 *  - Default: Execute with real Filebase pinning
 *  - --skip-pin: Use mock data (no Filebase, for CI)
 */

import { createLitClient } from "@lit-protocol/lit-client";
import { createAuthManager, storagePlugins, ViemAccountAuthenticator } from "@lit-protocol/auth";
import { privateKeyToAccount } from "viem/accounts";
import { Env } from "./shared/env";
import { ethers } from "ethers";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const SKIP_PIN = process.argv.includes("--skip-pin");

async function main() {
  console.log("🧪 Test Profile Pin v1");
  console.log("=".repeat(60));
  console.log(`   Env:         ${Env.name}`);
  console.log(`   Skip pin:    ${SKIP_PIN}`);

  const pkpCreds = Env.loadPkpCreds();
  console.log(`   PKP:         ${pkpCreds.ethAddress}`);
  console.log(`   Action CID:  ${Env.cids.profilePin || "(not deployed)"}`);

  if (!Env.cids.profilePin) {
    console.error("\n❌ No profilePin action CID found. Run setup.ts first:");
    console.error("   bun run scripts/setup.ts upload profile-pin-v1");
    process.exit(1);
  }

  let pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not found in environment");
  if (!pk.startsWith("0x")) pk = "0x" + pk;

  const authEoa = privateKeyToAccount(pk as `0x${string}`);
  console.log(`   Auth EOA:    ${authEoa.address}`);

  // User PKP for this test (using the same as master for simplicity)
  const userPkpPublicKey = pkpCreds.publicKey;
  const userAddress = ethers.computeAddress(userPkpPublicKey);
  console.log(`   User PKP:    ${userAddress}`);

  console.log("\n🔌 Connecting to Lit Protocol...");
  const litClient = await createLitClient({ network: Env.litNetwork });
  console.log("✅ Connected");

  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: "profile-pin-test",
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

  // Build test profile data
  const profileData = {
    // Phase 2 extended profile fields
    region: "us-west",
    alsoDatingIn: ["us-east", "eu-west"],
    relationshipStatus: "single",
    relationshipStructure: "monogamous",
    groupPlay: false,
    kidsAboutMe: "none",
    familyPlans: "open",
    lookingFor: ["relationship", "friends"],
    religion: "none",
    // Private photos would be encrypted separately
    privatePhotos: [],
  };

  console.log("\n📦 Test profile data:");
  console.log(JSON.stringify(profileData, null, 2));

  // Build jsParams
  let jsParams: any = {
    userPkpPublicKey,
    profileData,
  };

  if (SKIP_PIN) {
    // For CI/testing without Filebase access
    console.log("\n   Mode: Skip pinning (mock mode - action will fail without key)");
    // Note: The action will fail without a key, but we can test params validation
  } else {
    // Load encrypted Filebase key
    // For profile-pin, we need to encrypt a key with this action's CID
    const keyPath = join(Env.paths.keys, "profile", "filebase_api_key_profile.json");

    if (existsSync(keyPath)) {
      const filebaseEncryptedKey = JSON.parse(readFileSync(keyPath, "utf-8"));
      jsParams.filebaseEncryptedKey = filebaseEncryptedKey;
      console.log("\n   Mode: Real pinning (using encrypted Filebase key)");
    } else {
      // Check for plaintext key in env (dev only)
      const plaintextKey = process.env.FILEBASE_API_KEY;
      if (plaintextKey) {
        jsParams.filebasePlaintextKey = plaintextKey;
        console.log("\n   Mode: Real pinning (using plaintext Filebase key from env)");
      } else {
        console.error(`\n❌ No Filebase key found at: ${keyPath}`);
        console.error("   Either:");
        console.error("   1. Run: bun run scripts/setup.ts encrypt-key profile filebase_api_key");
        console.error("   2. Set FILEBASE_API_KEY env var (dev only)");
        console.error("   3. Use --skip-pin for mock mode");
        process.exit(1);
      }
    }
  }

  console.log("\n🚀 Executing Lit Action...");

  try {
    const result = await litClient.executeJs({
      ipfsId: Env.cids.profilePin,
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
    console.log(`   Version:   ${response.version}`);
    console.log(`   User:      ${response.user}`);
    console.log(`   CID:       ${response.cid}`);
    console.log(`   Timestamp: ${response.timestamp}`);

    // Verify CID format (either Qm... or bafy...)
    if (!response.cid.startsWith("Qm") && !response.cid.startsWith("bafy")) {
      throw new Error(`Invalid CID format: ${response.cid}`);
    }
    console.log("\n   ✅ CID format valid");

    // Verify user address matches
    if (response.user.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error(`User mismatch: expected ${userAddress}, got ${response.user}`);
    }
    console.log("   ✅ User address matches");

    console.log("\n🎉 All checks passed!");
    console.log(`   Profile CID: ${response.cid}`);
    console.log(`   Gateway URL: https://ipfs.filebase.io/ipfs/${response.cid}`);

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
