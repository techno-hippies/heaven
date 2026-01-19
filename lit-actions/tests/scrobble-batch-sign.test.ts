#!/usr/bin/env bun
/**
 * Test Scrobble Batch Sign Lit Action (with Filebase pinning)
 *
 * Verifies:
 *  - Action pins batch JSON to Filebase IPFS
 *  - Action returns deterministic inner/digest
 *  - Signature is present in result.signatures[sigName]
 *  - recoverAddress(digest, signature) === PKP address
 *
 * Modes:
 *  - Default: Uses encrypted Filebase key, pins real batch
 *  - --skip-pin: Uses pre-computed cidBytesHex (fast, no Filebase)
 */

import { createLitClient } from "@lit-protocol/lit-client";
import { createAuthManager, storagePlugins, ViemAccountAuthenticator } from "@lit-protocol/auth";
import { privateKeyToAccount } from "viem/accounts";
import { Env } from "./shared/env";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";

const CONTRACT = process.env.CONTRACT_ADDRESS ?? "0xeeC197414D3656d1fb4bA0d6E60AD4160aF64378";
const CHAIN_ID = Number(process.env.CHAIN_ID ?? "84532");
const SKIP_PIN = process.argv.includes("--skip-pin");

function extractSig(sigAny: any): string {
  if (!sigAny) throw new Error("missing signature: result.signatures[sigName] is empty");

  // Lit SDK returns: { signature: "0x<r><s>" (64 bytes), recoveryId: 0|1, ... }
  if (typeof sigAny === "object" && sigAny.signature) {
    let rs = sigAny.signature;
    if (!rs.startsWith("0x")) rs = "0x" + rs;

    // recoveryId is 0 or 1, need to convert to v (27 or 28)
    let v = sigAny.recoveryId ?? sigAny.recid ?? 0;
    v = Number(v);
    if (v === 0 || v === 1) v += 27;

    // Construct 65-byte signature: r (32) || s (32) || v (1)
    const vHex = v.toString(16).padStart(2, "0");
    return rs + vHex;
  }

  // Fallback: already a string signature
  if (typeof sigAny === "string") {
    let s = sigAny;
    s = s.replace(/^0x0x/, "0x");
    if (!s.startsWith("0x")) s = "0x" + s;
    return s;
  }

  throw new Error(`unexpected signature type: ${typeof sigAny}`);
}

async function main() {
  console.log("🧪 Test Scrobble Batch Sign");
  console.log("=".repeat(60));
  console.log(`   Env:         ${Env.name}`);
  console.log(`   Contract:    ${CONTRACT}`);
  console.log(`   Chain ID:    ${CHAIN_ID}`);
  console.log(`   Skip pin:    ${SKIP_PIN}`);

  const pkpCreds = Env.loadPkpCreds();
  console.log(`   PKP address: ${pkpCreds.ethAddress}`);
  console.log(`   Action CID:  ${Env.cids.scrobble}`);

  if (!Env.cids.scrobble) throw new Error("No scrobble action CID found (run setup.ts scrobble)");

  let pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not found");
  if (!pk.startsWith("0x")) pk = "0x" + pk;

  const authEoa = privateKeyToAccount(pk as `0x${string}`);
  console.log(`   Auth EOA:    ${authEoa.address}`);

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

  // Test parameters
  const startTs = 1700000000n;
  const endTs = 1700003599n;
  const nonce = 0n;
  const sigName = "scrobbleBatchSig_test";

  // Build jsParams based on mode
  let jsParams: any = {
    pkpPublicKey: pkpCreds.publicKey,
    contractAddress: CONTRACT,
    chainId: CHAIN_ID,
    startTs: startTs.toString(),
    endTs: endTs.toString(),
    nonce: nonce.toString(),
    sigName,
  };

  if (SKIP_PIN) {
    // Skip pinning mode - use pre-computed CID bytes
    const cidBytesHex = "0x" + "01".repeat(36);
    jsParams.skipPin = true;
    jsParams.cidBytesHex = cidBytesHex;
    jsParams.count = "123";
    console.log(`\n   Mode: Skip pinning (using fake CID bytes)`);
  } else {
    // Real pinning mode - provide tracks and encrypted key
    const tracks = [
      { artist: "Radiohead", title: "Karma Police", album: "OK Computer", duration: 263, playedAt: 1700000100 },
      { artist: "Portishead", title: "Glory Box", album: "Dummy", duration: 305, playedAt: 1700001000 },
      { artist: "Massive Attack", title: "Teardrop", album: "Mezzanine", duration: 331, playedAt: 1700002000 },
    ];

    // Load encrypted Filebase key
    const keyPath = join(Env.paths.keys, "scrobble", "filebase_api_key_scrobble.json");
    const filebaseEncryptedKey = JSON.parse(readFileSync(keyPath, "utf-8"));

    jsParams.tracks = tracks;
    jsParams.count = String(tracks.length);
    jsParams.filebaseEncryptedKey = filebaseEncryptedKey;

    console.log(`\n   Mode: Real pinning (${tracks.length} tracks)`);
    console.log(`   Tracks:`);
    tracks.forEach((t, i) => console.log(`     ${i + 1}. ${t.artist} - ${t.title}`));
  }

  console.log(`   startTs/endTs: ${startTs} / ${endTs}`);
  console.log(`   count/nonce:  ${jsParams.count} / ${nonce}`);

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

    // signature is in result.signatures[sigName], NOT in response
    const sigAny = (result as any).signatures?.[sigName];
    const signature = extractSig(sigAny);

    console.log("\n✍️  Signature:");
    console.log(`   ${signature.slice(0, 18)}...${signature.slice(-10)}`);

    // local recompute (must match response)
    const user = ethers.computeAddress(pkpCreds.publicKey);
    const cidBytes = ethers.getBytes(response.cidBytesHex);
    const cidHash = ethers.keccak256(cidBytes);
    const coder = ethers.AbiCoder.defaultAbiCoder();
    const encoded = coder.encode(
      ["uint256", "address", "address", "bytes32", "uint40", "uint40", "uint32", "uint64"],
      [BigInt(CHAIN_ID), CONTRACT, user, cidHash, startTs, endTs, BigInt(jsParams.count), nonce]
    );

    const inner = ethers.keccak256(encoded);
    const digest = ethers.hashMessage(ethers.getBytes(inner));

    console.log("\n🔎 Local verification:");
    console.log(`   user:     ${user}`);
    console.log(`   cidHash:  ${cidHash}`);
    console.log(`   inner:    ${inner}`);
    console.log(`   digest:   ${digest}`);

    if (inner.toLowerCase() !== String(response.inner).toLowerCase()) {
      throw new Error(`inner mismatch\nlocal:  ${inner}\naction: ${response.inner}`);
    }
    if (digest.toLowerCase() !== String(response.digest).toLowerCase()) {
      throw new Error(`digest mismatch\nlocal:  ${digest}\naction: ${response.digest}`);
    }

    const recovered = ethers.recoverAddress(digest, signature);
    console.log(`   recovered: ${recovered}`);
    console.log(`   expected:  ${user}`);

    if (recovered.toLowerCase() !== user.toLowerCase()) {
      throw new Error("signature does not recover PKP address");
    }

    console.log("\n✅ SUCCESS! Signature verifies and matches PKP address");
    console.log(`   CID bytes: ${response.cidBytesHex.slice(0, 30)}...`);
    console.log(`   Signature: ${signature.slice(0, 20)}...${signature.slice(-8)}`);

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
