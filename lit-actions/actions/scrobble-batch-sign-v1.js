/**
 * Scrobble Batch Sign v1 (deterministic response)
 *
 * Contract expects:
 *   inner  = keccak256(abi.encode(chainId, contract, user, keccak256(cid), startTs, endTs, count, nonce))
 *   digest = toEthSignedMessageHash(inner)  // EIP-191 "\x19Ethereum Signed Message:\n32" + inner
 *
 * We SIGN THE DIGEST BYTES with Lit.Actions.signEcdsa({ toSign: digestBytes, ... })
 * and read the final combined signature from result.signatures[sigName] on the client.
 *
 * IMPORTANT: Do NOT include signature or timestamps in setResponse.
 */

let ethersLib = globalThis.ethers;
if (!ethersLib) ethersLib = require("ethers");
const ethers = ethersLib;

const must0x = (s, label) => {
  if (typeof s !== "string" || !s.startsWith("0x")) throw new Error(`${label} must be 0x-prefixed`);
  return s;
};
const must = (v, label) => {
  if (v === undefined || v === null) throw new Error(`${label} is required`);
  return v;
};

const main = async () => {
  try {
    const {
      pkpPublicKey,
      contractAddress,
      chainId,
      cidBytesHex,
      startTs,
      endTs,
      count,
      nonce,
      sigName = "scrobbleBatchSig",
      user: userOverride,
    } = jsParams || {};

    must(pkpPublicKey, "pkpPublicKey");
    must(contractAddress, "contractAddress");
    must(chainId, "chainId");
    must(cidBytesHex, "cidBytesHex");
    must(startTs, "startTs");
    must(endTs, "endTs");
    must(count, "count");
    must(nonce, "nonce");

    const contract = ethers.utils.getAddress(contractAddress);
    const cidHex = must0x(cidBytesHex, "cidBytesHex");
    const cidBytes = ethers.utils.arrayify(cidHex);
    if (cidBytes.length === 0) throw new Error("cidBytesHex must not be empty");

    const user = ethers.utils.computeAddress(pkpPublicKey);
    if (userOverride) {
      const u = ethers.utils.getAddress(userOverride);
      if (u.toLowerCase() !== user.toLowerCase()) {
        throw new Error(`userOverride mismatch: expected ${user}, got ${u}`);
      }
    }

    // Basic sanity
    if (Number(count) <= 0) throw new Error("count must be > 0");
    if (Number(startTs) > Number(endTs)) throw new Error("startTs > endTs");

    const cidHash = ethers.utils.keccak256(cidBytes);

    // inner = keccak256(abi.encode(...))
    const encoded = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "address", "bytes32", "uint40", "uint40", "uint32", "uint64"],
      [chainId, contract, user, cidHash, startTs, endTs, count, nonce]
    );
    const inner = ethers.utils.keccak256(encoded);

    // digest = toEthSignedMessageHash(inner)
    const digest = ethers.utils.hashMessage(ethers.utils.arrayify(inner));

    // IMPORTANT:
    // - signEcdsa returns "success"
    // - combined signature is surfaced to the client in result.signatures[sigName]
    await Lit.Actions.signEcdsa({
      toSign: ethers.utils.arrayify(digest),
      publicKey: pkpPublicKey,
      sigName,
    });

    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: true,
        version: "scrobble-batch-sign-v1",
        chainId: String(chainId),
        contract,
        user,
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
