/**
 * Scrobble Batch Sponsor v2
 *
 * Flow:
 * 1. Receive batch data (tracks array) from client
 * 2. Decrypt Filebase API key (runOnce - only one node does external IO)
 * 3. Pin batch JSON to Filebase IPFS
 * 4. Compute digest matching ScrobbleLogV2.getDigest()
 * 5. Sign digest with USER's PKP (proves user authorized this batch)
 * 6. Build, sign, and broadcast TX with MASTER PKP (pays gas)
 *
 * Two PKPs involved:
 * - userPkpPublicKey: User's PKP that signs the batch digest (authenticity)
 * - MASTER_PKP: Sponsor PKP that submits tx and pays gas (relay)
 *
 * Contract expects:
 *   inner  = keccak256(abi.encode(chainId, contract, user, cidHash, startTs, endTs, count, nonce))
 *   digest = toEthSignedMessageHash(inner)
 *
 * CID encoding: UTF-8 bytes of the IPFS CID string (e.g., "Qm..." or "bafy...")
 */

const CHAIN_NAME = "baseSepolia";
const CHAIN_ID = 84532;
const CONTRACT_ADDRESS = "0x1AA06c3d5F4f26C8E1954C39C341C543b32963ea";

// Master/Sponsor PKP - fund this address with Base Sepolia ETH
const MASTER_PKP_PUBLIC_KEY =
  "0x044615ca5ec3bfec5f5306f62ccc1a398cbd7e9cc53ac0e715b27ba81272e7397b185aa6f43c9bb2f0d9c489d30478cec9310685cd3a33922c0d12417b6375bc08";
const MASTER_PKP_ADDRESS = "0x089fc7801D8f7D487765343a7946b1b97A7d29D4";

let ethersLib = globalThis.ethers;
if (!ethersLib) ethersLib = require("ethers");
const ethers = ethersLib;

// ============================================================
// HELPERS
// ============================================================

const strip0x = (v) => (String(v || "").startsWith("0x") ? String(v).slice(2) : String(v));
const isAddress = (v) => /^0x[0-9a-fA-F]{40}$/.test(v || "");

const must = (v, label) => {
  if (v === undefined || v === null) throw new Error(`${label} is required`);
  return v;
};

const toBigNumber = (value, label) => {
  if (typeof value === "bigint") return ethers.BigNumber.from(value.toString());
  if (typeof value === "number") return ethers.BigNumber.from(value);
  if (typeof value === "string") return ethers.BigNumber.from(value);
  throw new Error(`Invalid ${label}`);
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

async function pinToFilebase(filebaseApiKey, batchJson, fileName) {
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
      // User's PKP (signs the batch digest)
      userPkpPublicKey,

      // Batch data
      tracks, // array of { artist, title, album?, duration?, playedAt }

      // Nonce for replay protection (client must track this)
      nonce,

      // Encrypted Filebase API key
      filebaseEncryptedKey,
      filebasePlaintextKey, // dev override

      // Options
      dryRun = false, // skip broadcast, return signed tx
      skipPin = false, // use cidOverride instead of pinning
      cidOverride, // pre-pinned CID string (for testing)
    } = jsParams || {};

    must(userPkpPublicKey, "userPkpPublicKey");
    must(nonce, "nonce");

    if (!skipPin && !tracks) {
      throw new Error("tracks array is required (or use skipPin + cidOverride)");
    }
    if (skipPin && !cidOverride) {
      throw new Error("cidOverride required when skipPin=true");
    }

    // Validate tracks and compute metadata from actual data
    let count, startTs, endTs;
    let batchJson;

    if (!skipPin) {
      if (!Array.isArray(tracks) || tracks.length === 0) {
        throw new Error("tracks must be a non-empty array");
      }

      // Compute count, startTs, endTs from tracks (don't trust client values)
      count = tracks.length;
      const playedAts = tracks.map((t) => {
        if (!t.playedAt || !Number.isFinite(Number(t.playedAt))) {
          throw new Error("Each track must have a valid playedAt timestamp");
        }
        if (!t.artist || !t.title) {
          throw new Error("Each track must have artist and title");
        }
        return Number(t.playedAt);
      });
      startTs = Math.min(...playedAts);
      endTs = Math.max(...playedAts);

      if (startTs > endTs) throw new Error("Invalid timestamps");
    } else {
      // For skipPin mode, we need these from jsParams
      count = must(jsParams.count, "count (required when skipPin)");
      startTs = must(jsParams.startTs, "startTs (required when skipPin)");
      endTs = must(jsParams.endTs, "endTs (required when skipPin)");
    }

    const user = ethers.utils.computeAddress(userPkpPublicKey);
    const contract = ethers.utils.getAddress(CONTRACT_ADDRESS);

    // ========================================
    // STEP 1: Pin to Filebase (runOnce)
    // ========================================
    let cidString;

    if (skipPin) {
      cidString = cidOverride;
    } else {
      // Build batch JSON
      const batchData = {
        version: 1,
        user,
        startTs: String(startTs),
        endTs: String(endTs),
        count,
        tracks: tracks.map((t) => ({
          artist: t.artist,
          title: t.title,
          album: t.album || null,
          duration: t.duration || null,
          playedAt: t.playedAt,
        })),
      };
      batchJson = JSON.stringify(batchData);

      // Decrypt Filebase key
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

      // Pin to Filebase IPFS
      const fileName = `scrobble-${user.slice(2, 10)}-${startTs}-${nonce}.json`;
      cidString = await pinToFilebase(filebaseKey, batchJson, fileName);
    }

    // CID as UTF-8 bytes
    const encoder = new TextEncoder();
    const cidBytes = encoder.encode(cidString);
    const cidBytesHex = ethers.utils.hexlify(cidBytes);
    const cidHash = ethers.utils.keccak256(cidBytes);

    // ========================================
    // STEP 2: Sign digest with USER's PKP
    // ========================================
    const encoded = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "address", "bytes32", "uint40", "uint40", "uint32", "uint64"],
      [CHAIN_ID, contract, user, cidHash, startTs, endTs, count, nonce]
    );
    const inner = ethers.utils.keccak256(encoded);
    const digest = ethers.utils.hashMessage(ethers.utils.arrayify(inner));

    // Sign with user's PKP
    const userSigResult = await Lit.Actions.signAndCombineEcdsa({
      toSign: ethers.utils.arrayify(digest),
      publicKey: userPkpPublicKey,
      sigName: "userBatchSig",
    });

    const userSigObj = JSON.parse(userSigResult);
    let userV = Number(userSigObj.recid ?? userSigObj.recoveryId ?? userSigObj.v);
    if (userV === 0 || userV === 1) userV += 27;
    const userSig = ethers.utils.joinSignature({
      r: `0x${strip0x(userSigObj.r)}`,
      s: `0x${strip0x(userSigObj.s)}`,
      v: userV,
    });

    // ========================================
    // STEP 3: Build TX for commitBatch
    // ========================================
    const iface = new ethers.utils.Interface([
      "function commitBatch(address user, bytes cid, uint40 startTs, uint40 endTs, uint32 count, uint64 nonce, bytes userSig)",
    ]);

    const txData = iface.encodeFunctionData("commitBatch", [
      user,
      cidBytesHex,
      startTs,
      endTs,
      count,
      nonce,
      userSig,
    ]);

    // Get tx params (runOnce)
    const txParamsJson = await Lit.Actions.runOnce({ waitForResponse: true, name: "getTxParams" }, async () => {
      const endpoint = await Lit.Actions.getRpcUrl({ chain: CHAIN_NAME });
      const provider = new ethers.providers.JsonRpcProvider(endpoint);
      const [txNonce, feeData, gasEstimate] = await Promise.all([
        provider.getTransactionCount(MASTER_PKP_ADDRESS, "pending"),
        provider.getFeeData(),
        provider.estimateGas({
          from: MASTER_PKP_ADDRESS,
          to: CONTRACT_ADDRESS,
          data: txData,
        }),
      ]);

      const gasLimit = gasEstimate.mul(120).div(100);
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || feeData.gasPrice;
      const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice;

      return JSON.stringify({
        nonce: txNonce.toString(),
        gasLimit: gasLimit.toString(),
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
      });
    });

    const txParams = JSON.parse(txParamsJson);

    const unsignedTx = {
      type: 2,
      chainId: CHAIN_ID,
      nonce: toBigNumber(txParams.nonce, "nonce"),
      to: CONTRACT_ADDRESS,
      data: txData,
      gasLimit: toBigNumber(txParams.gasLimit, "gasLimit"),
      maxFeePerGas: toBigNumber(txParams.maxFeePerGas, "maxFeePerGas"),
      maxPriorityFeePerGas: toBigNumber(txParams.maxPriorityFeePerGas, "maxPriorityFeePerGas"),
      value: 0,
    };

    // ========================================
    // STEP 4: Sign TX with MASTER PKP
    // ========================================
    const txHash = ethers.utils.keccak256(ethers.utils.serializeTransaction(unsignedTx));

    const masterSigResult = await Lit.Actions.signAndCombineEcdsa({
      toSign: Array.from(ethers.utils.arrayify(txHash)),
      publicKey: MASTER_PKP_PUBLIC_KEY,
      sigName: "masterTxSig",
    });

    const masterSigObj = JSON.parse(masterSigResult);
    let masterV = Number(masterSigObj.recid ?? masterSigObj.recoveryId ?? masterSigObj.v);
    if (masterV === 0 || masterV === 1) masterV += 27;
    const masterSig = ethers.utils.joinSignature({
      r: `0x${strip0x(masterSigObj.r)}`,
      s: `0x${strip0x(masterSigObj.s)}`,
      v: masterV,
    });

    const signedTx = ethers.utils.serializeTransaction(unsignedTx, masterSig);

    // ========================================
    // STEP 5: Broadcast (or return if dryRun)
    // ========================================
    if (dryRun) {
      Lit.Actions.setResponse({
        response: JSON.stringify({
          success: true,
          dryRun: true,
          version: "scrobble-batch-sponsor-v2",
          signedTx,
          txHash,
          user,
          cidString,
          cidBytesHex,
          cidHash,
          startTs: String(startTs),
          endTs: String(endTs),
          count: String(count),
          nonce: String(nonce),
          contract: CONTRACT_ADDRESS,
          chainId: CHAIN_ID,
          sponsor: MASTER_PKP_ADDRESS,
        }),
      });
      return;
    }

    // Broadcast (runOnce)
    const broadcastTxHash = await Lit.Actions.runOnce({ waitForResponse: true, name: "broadcastTx" }, async () => {
      const endpoint = await Lit.Actions.getRpcUrl({ chain: CHAIN_NAME });
      const provider = new ethers.providers.JsonRpcProvider(endpoint);
      const tx = await provider.sendTransaction(signedTx);
      return tx.hash;
    });

    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: true,
        version: "scrobble-batch-sponsor-v2",
        txHash: broadcastTxHash,
        user,
        cidString,
        cidBytesHex,
        cidHash,
        startTs: String(startTs),
        endTs: String(endTs),
        count: String(count),
        nonce: String(nonce),
        contract: CONTRACT_ADDRESS,
        chainId: CHAIN_ID,
        sponsor: MASTER_PKP_ADDRESS,
      }),
    });
  } catch (e) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: false,
        version: "scrobble-batch-sponsor-v2",
        error: e?.message || String(e),
      }),
    });
  }
};

main();
