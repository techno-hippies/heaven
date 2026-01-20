/**
 * Profile Pin v1
 *
 * Pins encrypted profile data to Filebase IPFS.
 * Returns the CID for the client to use with updateHeavenName().
 *
 * Flow:
 * 1. Receive profile data from client
 * 2. Decrypt Filebase API key (runOnce - only one node does external IO)
 * 3. Pin profile JSON to Filebase IPFS
 * 4. Return CID
 *
 * Required jsParams:
 * - userPkpPublicKey: User's PKP public key (for deriving address/filename)
 * - profileData: Object containing profile fields to store
 * - filebaseEncryptedKey: Lit-encrypted Filebase credentials (or filebasePlaintextKey for dev)
 *
 * Optional jsParams:
 * - filebasePlaintextKey: Dev override for Filebase key (skip decryption)
 *
 * Returns: { success: true, cid: string } or { success: false, error: string }
 */

let ethersLib = globalThis.ethers;
if (!ethersLib) ethersLib = require("ethers");
const ethers = ethersLib;

// ============================================================
// HELPERS
// ============================================================

const must = (v, label) => {
  if (v === undefined || v === null) throw new Error(`${label} is required`);
  return v;
};

// ============================================================
// FILEBASE IPFS PINNING (S3-compatible with AWS Sig V4)
// ============================================================

async function sha256Hex(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(key, message) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? encoder.encode(key) : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
}

async function hmacHex(key, message) {
  const sig = await hmacSha256(key, message);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getSigningKey(secretKey, dateStamp, region, service) {
  const encoder = new TextEncoder();
  const kDate = await hmacSha256(encoder.encode("AWS4" + secretKey), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

async function pinToFilebase(filebaseApiKey, jsonContent, fileName) {
  const decoded = atob(filebaseApiKey);
  const [accessKey, secretKey, bucket] = decoded.split(":");
  if (!accessKey || !secretKey || !bucket) {
    throw new Error("Invalid Filebase API key format");
  }

  const endpoint = "s3.filebase.com";
  const region = "us-east-1";
  const service = "s3";

  const date = new Date();
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const canonicalUri = `/${bucket}/${fileName}`;
  const payloadHash = await sha256Hex(jsonContent);

  const canonicalHeaders =
    [`host:${endpoint}`, `x-amz-content-sha256:${payloadHash}`, `x-amz-date:${amzDate}`].join("\n") + "\n";
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [algorithm, amzDate, credentialScope, await sha256Hex(canonicalRequest)].join("\n");

  const signingKey = await getSigningKey(secretKey, dateStamp, region, service);
  const signature = await hmacHex(signingKey, stringToSign);

  const authHeader = [
    `${algorithm} Credential=${accessKey}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(", ");

  const response = await fetch(`https://${endpoint}${canonicalUri}`, {
    method: "PUT",
    headers: {
      Authorization: authHeader,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      "Content-Type": "application/json",
    },
    body: jsonContent,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Filebase upload failed: ${response.status} ${text}`);
  }

  const cid = response.headers.get("x-amz-meta-cid");
  if (!cid) {
    throw new Error("No CID returned from Filebase");
  }

  return cid;
}

// ============================================================
// MAIN
// ============================================================

const main = async () => {
  try {
    const {
      userPkpPublicKey,
      profileData,
      filebaseEncryptedKey,
      filebasePlaintextKey, // dev override
    } = jsParams || {};

    must(userPkpPublicKey, "userPkpPublicKey");
    must(profileData, "profileData");

    if (typeof profileData !== "object") {
      throw new Error("profileData must be an object");
    }

    // Derive user address for filename
    const userAddress = ethers.utils.computeAddress(userPkpPublicKey);
    const timestamp = Math.floor(Date.now() / 1000);

    // Build profile JSON with metadata
    const profileJson = JSON.stringify({
      version: 1,
      user: userAddress,
      createdAt: timestamp,
      updatedAt: timestamp,
      data: profileData,
    });

    // Decrypt Filebase key (or use plaintext for dev)
    let filebaseKey;
    if (filebasePlaintextKey) {
      filebaseKey = filebasePlaintextKey;
    } else if (filebaseEncryptedKey) {
      filebaseKey = await Lit.Actions.decryptAndCombine({
        accessControlConditions: filebaseEncryptedKey.accessControlConditions,
        ciphertext: filebaseEncryptedKey.ciphertext,
        dataToEncryptHash: filebaseEncryptedKey.dataToEncryptHash,
        authSig: null,
        chain: "ethereum",
      });
    } else {
      throw new Error("filebaseEncryptedKey or filebasePlaintextKey is required");
    }

    // Pin to Filebase (runOnce ensures only one node does the upload)
    const cid = await Lit.Actions.runOnce(
      { waitForResponse: true, name: "pinProfile" },
      async () => {
        const fileName = `profile-${userAddress.slice(2, 10)}-${timestamp}.json`;
        return pinToFilebase(filebaseKey, profileJson, fileName);
      }
    );

    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: true,
        version: "profile-pin-v1",
        cid,
        user: userAddress,
        timestamp,
      }),
    });
  } catch (e) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: false,
        version: "profile-pin-v1",
        error: e?.message || String(e),
      }),
    });
  }
};

main();
