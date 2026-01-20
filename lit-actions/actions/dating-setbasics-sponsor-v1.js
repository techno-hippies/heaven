/**
 * Dating SetBasics Sponsor v1
 *
 * Sponsors DatingV3.setBasicsFor() - user signs authorization, sponsor PKP pays gas.
 *
 * Flow:
 * 1. Receive FHE-encrypted values from client (client encrypts using Zama SDK)
 * 2. User's PKP signs EIP-712 authorization for the encrypted data + deadline
 * 3. Build setBasicsFor() calldata with user signature
 * 4. Sign TX with sponsor PKP (pays gas)
 * 5. Broadcast to chain
 *
 * Required jsParams:
 * - userPkpPublicKey: User's PKP public key (signs the authorization, uncompressed 0x04...)
 * - sponsorPkpPublicKey: Sponsor PKP public key (pays gas, must be setBasicsSponsor)
 * - encAge: FHE-encrypted age handle (bytes32 hex string)
 * - encGenderId: FHE-encrypted gender ID handle (bytes32 hex string)
 * - encDesiredMask: FHE-encrypted desired mask handle (bytes32 hex string)
 * - encShareAge: FHE-encrypted shareAge bool handle (bytes32 hex string)
 * - encShareGender: FHE-encrypted shareGender bool handle (bytes32 hex string)
 * - proof: FHE proof bytes (hex string)
 *
 * Optional jsParams:
 * - dryRun: boolean (skip broadcast, return signedTx)
 * - chainId: number (override chain ID, default 11155111 Sepolia)
 * - contractAddress: string (override contract address)
 * - nonce: string (override user's setBasics nonce as string, fetched if not provided)
 * - deadlineSeconds: number (signature validity in seconds, default 300 = 5 min)
 *
 * Returns: { success: true, txHash: string } or { success: false, error: string }
 */

// Default to Sepolia (Zama fhEVM testnet)
const DEFAULT_CHAIN_ID = 11155111;
const DEFAULT_CONTRACT_ADDRESS = "0xcAb2919b79D367988FB843420Cdd7665431AE0e7";
const DEFAULT_DEADLINE_SECONDS = 300; // 5 minutes
const DEFAULT_GAS_LIMIT = 2000000; // 2M fallback for FHE ops
const DEFAULT_GAS_PRICE_GWEI = 20; // 20 gwei fallback

// EIP-712 domain and types (must match contract)
const EIP712_DOMAIN = {
  name: "Heaven",
  version: "3",
};

// Must match contract: "SetBasics(address user,bytes32 dataHash,uint64 deadline,uint64 nonce)"
const SET_BASICS_TYPEHASH = "SetBasics(address user,bytes32 dataHash,uint64 deadline,uint64 nonce)";

// Chain ID -> RPC chain name mapping
const CHAIN_NAMES = {
  11155111: "sepolia",
  // Add other chains as needed
};

let ethersLib = globalThis.ethers;
if (!ethersLib) ethersLib = require("ethers");
const ethers = ethersLib;

// ============================================================
// HELPERS
// ============================================================

const strip0x = (v) => (String(v || "").startsWith("0x") ? String(v).slice(2) : String(v));
const ensure0x = (v) => (String(v || "").startsWith("0x") ? String(v) : `0x${v}`);
const isHexString = (v) => /^0x[0-9a-fA-F]*$/.test(v || "");

const must = (v, label) => {
  if (v === undefined || v === null) throw new Error(`${label} is required`);
  return v;
};

const mustHex = (v, label) => {
  const hex = ensure0x(v);
  if (!isHexString(hex)) throw new Error(`${label} must be a hex string`);
  return hex;
};

// ============================================================
// MAIN
// ============================================================

const main = async () => {
  try {
    const {
      userPkpPublicKey,
      sponsorPkpPublicKey,
      encAge,
      encGenderId,
      encDesiredMask,
      encShareAge,
      encShareGender,
      proof,
      dryRun = false,
      chainId = DEFAULT_CHAIN_ID,
      contractAddress = DEFAULT_CONTRACT_ADDRESS,
      nonce: providedNonce,
      deadlineSeconds = DEFAULT_DEADLINE_SECONDS,
    } = jsParams || {};

    must(userPkpPublicKey, "userPkpPublicKey");
    must(sponsorPkpPublicKey, "sponsorPkpPublicKey");
    must(encAge, "encAge");
    must(encGenderId, "encGenderId");
    must(encDesiredMask, "encDesiredMask");
    must(encShareAge, "encShareAge");
    must(encShareGender, "encShareGender");
    must(proof, "proof");

    // Validate and normalize hex strings (all FHE handles are bytes32)
    const encAgeHex = ethers.utils.hexZeroPad(mustHex(encAge, "encAge"), 32);
    const encGenderIdHex = ethers.utils.hexZeroPad(mustHex(encGenderId, "encGenderId"), 32);
    const encDesiredMaskHex = ethers.utils.hexZeroPad(mustHex(encDesiredMask, "encDesiredMask"), 32);
    const encShareAgeHex = ethers.utils.hexZeroPad(mustHex(encShareAge, "encShareAge"), 32);
    const encShareGenderHex = ethers.utils.hexZeroPad(mustHex(encShareGender, "encShareGender"), 32);
    const proofHex = mustHex(proof, "proof");

    const userAddress = ethers.utils.computeAddress(userPkpPublicKey);
    const sponsorAddress = ethers.utils.computeAddress(sponsorPkpPublicKey);
    const resolvedChainId = Number(chainId);
    const chainName = CHAIN_NAMES[resolvedChainId];
    if (!chainName) throw new Error(`Unsupported chainId: ${resolvedChainId}`);

    // Calculate deadline (current time + deadlineSeconds)
    const deadlineTimestamp = Math.floor(Date.now() / 1000) + Number(deadlineSeconds);

    // Get user's nonce from contract (if not provided)
    // Keep as string to avoid BigInt precision issues
    let userNonce;
    if (providedNonce !== undefined) {
      userNonce = String(providedNonce);
    } else {
      const nonceJson = await Lit.Actions.runOnce(
        { waitForResponse: true, name: "getUserNonce" },
        async () => {
          const endpoint = await Lit.Actions.getRpcUrl({ chain: chainName });
          const provider = new ethers.providers.JsonRpcProvider(endpoint);
          const contract = new ethers.Contract(
            contractAddress,
            ["function setBasicsNonce(address) view returns (uint64)"],
            provider
          );
          const n = await contract.setBasicsNonce(userAddress);
          return JSON.stringify({ nonce: n.toString() });
        }
      );
      userNonce = JSON.parse(nonceJson).nonce;
    }

    // Build data hash using abi.encode (must match contract)
    // Contract: keccak256(abi.encode(claimedAge, genderId, desiredMask, shareAge, shareGender, keccak256(proof)))
    const proofHash = ethers.utils.keccak256(proofHex);
    const dataHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
        [encAgeHex, encGenderIdHex, encDesiredMaskHex, encShareAgeHex, encShareGenderHex, proofHash]
      )
    );

    // Build EIP-712 domain separator
    const domainSeparator = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "bytes32", "uint256", "address"],
        [
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(
              "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
            )
          ),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes(EIP712_DOMAIN.name)),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes(EIP712_DOMAIN.version)),
          resolvedChainId,
          contractAddress,
        ]
      )
    );

    // Build struct hash
    // Contract: keccak256(abi.encode(SET_BASICS_TYPEHASH, user, dataHash, deadline, nonce))
    const structHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "address", "bytes32", "uint64", "uint64"],
        [
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes(SET_BASICS_TYPEHASH)),
          userAddress,
          dataHash,
          deadlineTimestamp,
          userNonce,
        ]
      )
    );

    // Build EIP-712 digest using canonical bytes2 prefix
    const digest = ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ["bytes2", "bytes32", "bytes32"],
        ["0x1901", domainSeparator, structHash]
      )
    );

    // Sign with user's PKP (authorization)
    const userSigResult = await Lit.Actions.signAndCombineEcdsa({
      toSign: Array.from(ethers.utils.arrayify(digest)),
      publicKey: userPkpPublicKey,
      sigName: "userAuthSig",
    });

    const userSigObj = JSON.parse(userSigResult);
    let userV = Number(userSigObj.recid ?? userSigObj.recoveryId ?? userSigObj.v);
    if (userV === 0 || userV === 1) userV += 27;
    const userSig = ethers.utils.joinSignature({
      r: `0x${strip0x(userSigObj.r)}`,
      s: `0x${strip0x(userSigObj.s)}`,
      v: userV,
    });

    // Build setBasicsFor calldata
    // function setBasicsFor(address user, bytes32 claimedAge, bytes32 genderId, bytes32 desiredMask,
    //                       bytes32 shareAge, bytes32 shareGender, bytes proof, uint64 deadline, bytes userSig)
    const iface = new ethers.utils.Interface([
      "function setBasicsFor(address user, bytes32 claimedAge, bytes32 genderId, bytes32 desiredMask, bytes32 shareAge, bytes32 shareGender, bytes proof, uint64 deadline, bytes userSig)",
    ]);

    const txData = iface.encodeFunctionData("setBasicsFor", [
      userAddress,
      encAgeHex,
      encGenderIdHex,
      encDesiredMaskHex,
      encShareAgeHex,
      encShareGenderHex,
      proofHex,
      deadlineTimestamp,
      userSig,
    ]);

    // Get sponsor TX params with robust fallbacks
    const txParamsJson = await Lit.Actions.runOnce(
      { waitForResponse: true, name: "getTxParams" },
      async () => {
        const endpoint = await Lit.Actions.getRpcUrl({ chain: chainName });
        const provider = new ethers.providers.JsonRpcProvider(endpoint);

        const [nonce, feeData, gasEstimate] = await Promise.all([
          provider.getTransactionCount(sponsorAddress, "pending"),
          provider.getFeeData(),
          provider
            .estimateGas({
              from: sponsorAddress,
              to: contractAddress,
              data: txData,
            })
            .catch(() => null),
        ]);

        // Gas limit: use estimate with 50% buffer, or fallback
        const gasLimit = gasEstimate
          ? gasEstimate.mul(150).div(100)
          : ethers.BigNumber.from(DEFAULT_GAS_LIMIT);

        // Fee handling with fallbacks
        let maxFeePerGas = feeData.maxFeePerGas;
        let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

        // If EIP-1559 fees not available, try legacy gasPrice
        if (!maxFeePerGas || !maxPriorityFeePerGas) {
          const legacyPrice = feeData.gasPrice || (await provider.getGasPrice().catch(() => null));
          if (legacyPrice) {
            maxFeePerGas = legacyPrice;
            maxPriorityFeePerGas = legacyPrice;
          } else {
            // Hard fallback
            const fallbackPrice = ethers.utils.parseUnits(String(DEFAULT_GAS_PRICE_GWEI), "gwei");
            maxFeePerGas = fallbackPrice;
            maxPriorityFeePerGas = fallbackPrice;
          }
        }

        return JSON.stringify({
          nonce: nonce.toString(),
          gasLimit: gasLimit.toString(),
          maxFeePerGas: maxFeePerGas.toString(),
          maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
        });
      }
    );

    const txParams = JSON.parse(txParamsJson);

    const unsignedTx = {
      type: 2,
      chainId: resolvedChainId,
      nonce: ethers.BigNumber.from(txParams.nonce),
      to: contractAddress,
      data: txData,
      gasLimit: ethers.BigNumber.from(txParams.gasLimit),
      maxFeePerGas: ethers.BigNumber.from(txParams.maxFeePerGas),
      maxPriorityFeePerGas: ethers.BigNumber.from(txParams.maxPriorityFeePerGas),
      value: 0,
    };

    // Sign with sponsor PKP (pays gas)
    const txHash = ethers.utils.keccak256(ethers.utils.serializeTransaction(unsignedTx));

    const sponsorSigResult = await Lit.Actions.signAndCombineEcdsa({
      toSign: Array.from(ethers.utils.arrayify(txHash)),
      publicKey: sponsorPkpPublicKey,
      sigName: "sponsorTxSig",
    });

    const sponsorSigObj = JSON.parse(sponsorSigResult);
    let sponsorV = Number(sponsorSigObj.recid ?? sponsorSigObj.recoveryId ?? sponsorSigObj.v);
    if (sponsorV === 0 || sponsorV === 1) sponsorV += 27;
    const sponsorSig = ethers.utils.joinSignature({
      r: `0x${strip0x(sponsorSigObj.r)}`,
      s: `0x${strip0x(sponsorSigObj.s)}`,
      v: sponsorV,
    });

    const signedTx = ethers.utils.serializeTransaction(unsignedTx, sponsorSig);

    if (dryRun) {
      Lit.Actions.setResponse({
        response: JSON.stringify({
          success: true,
          version: "dating-setbasics-sponsor-v1",
          dryRun: true,
          signedTx,
          txHash,
          user: userAddress,
          sponsor: sponsorAddress,
          contract: contractAddress,
          chainId: resolvedChainId,
          userNonce,
          deadline: deadlineTimestamp,
          dataHash,
          digest,
        }),
      });
      return;
    }

    // Broadcast (runOnce)
    const broadcastTxHash = await Lit.Actions.runOnce(
      { waitForResponse: true, name: "broadcastTx" },
      async () => {
        const endpoint = await Lit.Actions.getRpcUrl({ chain: chainName });
        const provider = new ethers.providers.JsonRpcProvider(endpoint);
        const tx = await provider.sendTransaction(signedTx);
        return tx.hash;
      }
    );

    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: true,
        version: "dating-setbasics-sponsor-v1",
        txHash: broadcastTxHash,
        user: userAddress,
        sponsor: sponsorAddress,
        contract: contractAddress,
        chainId: resolvedChainId,
        userNonce,
        deadline: deadlineTimestamp,
      }),
    });
  } catch (e) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: false,
        version: "dating-setbasics-sponsor-v1",
        error: e?.message || String(e),
      }),
    });
  }
};

main();
