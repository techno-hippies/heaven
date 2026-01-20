#!/usr/bin/env bun
/**
 * Test Scrobble Batch Sign v2 Lit Action
 *
 * Verifies:
 *  - Action pins batch JSON to Filebase IPFS (via runOnce)
 *  - User PKP signs the batch digest
 *  - Master PKP signs and broadcasts tx (or returns signed tx if dryRun)
 *  - Transaction is valid and can be submitted to contract
 *
 * Modes:
 *  - Default (--dry-run): Execute action but don't broadcast
 *  - --broadcast: Actually submit tx to Base Sepolia
 *  - --skip-pin: Use pre-computed CID (fast, no Filebase)
 */

import { createLitClient } from "@lit-protocol/lit-client";
import { createAuthManager, storagePlugins, ViemAccountAuthenticator } from "@lit-protocol/auth";
import { privateKeyToAccount } from "viem/accounts";
import { Env } from "./shared/env";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";

const CONTRACT = "0x1AA06c3d5F4f26C8E1954C39C341C543b32963ea";
const CHAIN_ID = 84532;
const SKIP_PIN = process.argv.includes("--skip-pin");
const DRY_RUN = !process.argv.includes("--broadcast");

async function main() {
  console.log("🧪 Test Scrobble Batch Sign v2");
  console.log("=".repeat(60));
  console.log(`   Env:         ${Env.name}`);
  console.log(`   Contract:    ${CONTRACT}`);
  console.log(`   Chain ID:    ${CHAIN_ID}`);
  console.log(`   Skip pin:    ${SKIP_PIN}`);
  console.log(`   Dry run:     ${DRY_RUN}`);

  const pkpCreds = Env.loadPkpCreds();
  console.log(`   Master PKP:  ${pkpCreds.ethAddress}`);
  console.log(`   Action CID:  ${Env.cids.scrobble}`);

  if (!Env.cids.scrobble) throw new Error("No scrobble action CID found (run setup.ts scrobble)");

  let pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not found");
  if (!pk.startsWith("0x")) pk = "0x" + pk;

  const authEoa = privateKeyToAccount(pk as `0x${string}`);
  console.log(`   Auth EOA:    ${authEoa.address}`);

  // For testing, we'll use a test user PKP (same as master for simplicity)
  // In production, this would be the user's actual PKP
  const userPkpPublicKey = pkpCreds.publicKey;
  const userAddress = ethers.computeAddress(userPkpPublicKey);
  console.log(`   User PKP:    ${userAddress}`);

  console.log("\n🔌 Connecting to Lit Protocol...");
  const litClient = await createLitClient({ network: Env.litNetwork });
  console.log("✅ Connected");

  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: "scrobble-batch-sign-test",
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

  // Use a unique nonce based on timestamp to avoid replay
  const nonce = Math.floor(Date.now() / 1000);

  // Build jsParams based on mode
  let jsParams: any = {
    userPkpPublicKey,
    nonce,
    dryRun: DRY_RUN,
  };

  if (SKIP_PIN) {
    // Skip pinning mode - use pre-computed CID
    const cidOverride = "QmTestCidForSkipPinMode12345678901234567890";
    const now = Math.floor(Date.now() / 1000);
    jsParams.skipPin = true;
    jsParams.cidOverride = cidOverride;
    jsParams.count = 3;
    jsParams.startTs = now - 3600;
    jsParams.endTs = now;
    console.log(`\n   Mode: Skip pinning (using fake CID)`);
  } else {
    // Real pinning mode - provide tracks and encrypted key
    const now = Math.floor(Date.now() / 1000);
    const tracks = [
      { artist: "Radiohead", title: "Karma Police", album: "OK Computer", duration: 263, playedAt: now - 3000 },
      { artist: "Portishead", title: "Glory Box", album: "Dummy", duration: 305, playedAt: now - 2000 },
      { artist: "Massive Attack", title: "Teardrop", album: "Mezzanine", duration: 331, playedAt: now - 1000 },
    ];

    // Load encrypted Filebase key
    const keyPath = join(Env.paths.keys, "scrobble", "filebase_api_key_scrobble.json");
    const filebaseEncryptedKey = JSON.parse(readFileSync(keyPath, "utf-8"));

    jsParams.tracks = tracks;
    jsParams.filebaseEncryptedKey = filebaseEncryptedKey;

    console.log(`\n   Mode: Real pinning (${tracks.length} tracks)`);
    console.log(`   Tracks:`);
    tracks.forEach((t, i) => console.log(`     ${i + 1}. ${t.artist} - ${t.title}`));
  }

  console.log(`   nonce: ${nonce}`);

  console.log("\n🚀 Executing Lit Action...");

  try {
    const result = await litClient.executeJs({
      ipfsId: Env.cids.scrobble,
      authContext,
      jsParams,
    });

    console.log("✅ Lit Action executed");

    const response =
      typeof result.response === "string" ? JSON.parse(result.response) : result.response;

    console.log("\n📦 Action response:");
    console.log(JSON.stringify(response, null, 2));

    if (!response?.success) throw new Error(response?.error || "action returned success=false");

    console.log("\n✅ SUCCESS!");
    console.log(`   Version:   ${response.version}`);
    console.log(`   User:      ${response.user}`);
    console.log(`   CID:       ${response.cidString}`);
    console.log(`   cidHash:   ${response.cidHash}`);
    console.log(`   startTs:   ${response.startTs}`);
    console.log(`   endTs:     ${response.endTs}`);
    console.log(`   count:     ${response.count}`);
    console.log(`   nonce:     ${response.nonce}`);
    console.log(`   sponsor:   ${response.sponsor}`);

    if (DRY_RUN) {
      console.log(`\n   Dry run mode - transaction NOT broadcast`);
      console.log(`   Signed TX: ${response.signedTx?.slice(0, 50)}...`);
      console.log(`   TX Hash:   ${response.txHash}`);
    } else {
      console.log(`\n   🎉 Transaction broadcast!`);
      console.log(`   TX Hash: ${response.txHash}`);
      console.log(`   View: https://sepolia.basescan.org/tx/${response.txHash}`);
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
