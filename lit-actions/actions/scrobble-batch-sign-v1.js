/**
 * Scrobble Batch Sign v1 (with Filebase pinning)
 *
 * Flow:
 * 1. Receive batch data (tracks array) from client
 * 2. Decrypt Filebase API key (only accessible inside Lit nodes)
 * 3. Pin batch JSON to Filebase IPFS
 * 4. Compute digest matching ScrobbleLogV2.getDigest()
 * 5. Sign digest with PKP
 * 6. Return CID + signature (client can call contract directly)
 *
 * Contract expects:
 *   inner  = keccak256(abi.encode(chainId, contract, user, keccak256(cidBytes), startTs, endTs, count, nonce))
 *   digest = toEthSignedMessageHash(inner)
 *
 * IMPORTANT: Response must be deterministic (no timestamps/random values)
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

const must0x = (s, label) => {
  if (typeof s !== "string" || !s.startsWith("0x")) throw new Error(`${label} must be 0x-prefixed`);
  return s;
};

// ============================================================
// FILEBASE IPFS PINNING (S3-compatible with AWS Sig V4)
// ============================================================

async function sha256Hex(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
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
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function getSigningKey(secretKey, dateStamp, region, service) {
  const encoder = new TextEncoder();
  const kDate = await hmacSha256(encoder.encode("AWS4" + secretKey), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

async function pinToFilebase(filebaseApiKey, batchJson, fileName) {
  // Decode base64 key: "accessKey:secretKey:bucket"
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
  const payloadHash = await sha256Hex(batchJson);

  const canonicalHeaders = [
    `host:${endpoint}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n") + "\n";
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

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
    body: batchJson,
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
      pkpPublicKey,
      contractAddress,
      chainId,

      // Batch data - either provide tracks array OR pre-computed values
      tracks,              // array of { artist, title, album?, duration?, playedAt }
      batchJsonOverride,   // string: skip tracks, use this JSON directly (for testing)

      // Pre-computed values (if not providing tracks)
      cidBytesHex,         // 0x... raw CID bytes (skip pinning)

      // Batch metadata
      startTs,
      endTs,
      count,
      nonce,

      // Encrypted Filebase API key (from keys/dev/scrobble/)
      filebaseEncryptedKey,
      filebasePlaintextKey, // dev override (testing only)

      sigName = "scrobbleBatchSig",
      user: userOverride,
      skipPin = false,     // skip pinning, use cidBytesHex directly
    } = jsParams || {};

    must(pkpPublicKey, "pkpPublicKey");
    must(contractAddress, "contractAddress");
    must(chainId, "chainId");
    must(startTs, "startTs");
    must(endTs, "endTs");
    must(count, "count");
    must(nonce, "nonce");

    const contract = ethers.utils.getAddress(contractAddress);
    const user = ethers.utils.computeAddress(pkpPublicKey);

    if (userOverride) {
      const u = ethers.utils.getAddress(userOverride);
      if (u.toLowerCase() !== user.toLowerCase()) {
        throw new Error(`userOverride mismatch: expected ${user}, got ${u}`);
      }
    }

    // Validate batch params
    if (Number(count) <= 0) throw new Error("count must be > 0");
    if (Number(startTs) > Number(endTs)) throw new Error("startTs > endTs");

    let cidBytes;
    let cidHex;

    if (skipPin && cidBytesHex) {
      // Use pre-computed CID (testing mode)
      cidHex = must0x(cidBytesHex, "cidBytesHex");
      cidBytes = ethers.utils.arrayify(cidHex);
    } else {
      // Pin batch to Filebase
      if (!tracks && !batchJsonOverride) {
        throw new Error("tracks array or batchJsonOverride is required");
      }

      // Build batch JSON
      const batchData = batchJsonOverride ? JSON.parse(batchJsonOverride) : {
        version: 1,
        user,
        startTs: String(startTs),
        endTs: String(endTs),
        count: Number(count),
        tracks: tracks.map(t => ({
          artist: t.artist,
          title: t.title,
          album: t.album || null,
          duration: t.duration || null,
          playedAt: t.playedAt,
        })),
      };

      const batchJson = JSON.stringify(batchData);

      // Decrypt Filebase API key
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

      // Pin to Filebase
      const fileName = `scrobble-${user.slice(2, 10)}-${startTs}-${nonce}.json`;
      const cid = await pinToFilebase(filebaseKey, batchJson, fileName);

      // Convert CID string to bytes (CIDv1 base32 -> raw bytes)
      // For simplicity, we'll use the CID string directly and hash it
      // The contract uses keccak256(cidBytes), so we need the raw CID bytes
      // CID.parse() would give us bytes, but we don't have multiformats in Lit
      // Instead, encode the CID string as UTF-8 bytes
      const encoder = new TextEncoder();
      cidBytes = encoder.encode(cid);
      cidHex = ethers.utils.hexlify(cidBytes);
    }

    if (cidBytes.length === 0) throw new Error("cidBytes must not be empty");

    // Compute digest (must match ScrobbleLogV2.getDigest)
    const cidHash = ethers.utils.keccak256(cidBytes);

    const encoded = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "address", "bytes32", "uint40", "uint40", "uint32", "uint64"],
      [chainId, contract, user, cidHash, startTs, endTs, count, nonce]
    );
    const inner = ethers.utils.keccak256(encoded);
    const digest = ethers.utils.hashMessage(ethers.utils.arrayify(inner));

    // Sign with PKP (signature comes back in result.signatures[sigName])
    await Lit.Actions.signEcdsa({
      toSign: ethers.utils.arrayify(digest),
      publicKey: pkpPublicKey,
      sigName,
    });

    // Deterministic response (no timestamps!)
    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: true,
        version: "scrobble-batch-sign-v1",
        chainId: String(chainId),
        contract,
        user,
        cidBytesHex: cidHex,
        cidHash,
        inner,
        digest,
        startTs: String(startTs),
        endTs: String(endTs),
        count: String(count),
        nonce: String(nonce),
        sigName,
      }),
    });
  } catch (e) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: false,
        version: "scrobble-batch-sign-v1",
        error: e?.message || String(e),
      }),
    });
  }
};

main();
