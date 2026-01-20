/**
 * Dating SetBasics v1
 *
 * Signs and broadcasts DatingV3.setBasics() using the user's PKP.
 * The user's PKP must have gas on the target chain.
 *
 * NOTE: setBasics() requires msg.sender == user, so we can't use a sponsor PKP.
 * The user's PKP address must have ETH on Sepolia (or target fhEVM chain).
 *
 * Flow:
 * 1. Receive FHE-encrypted values from client (client encrypts using Zama SDK)
 * 2. Build setBasics() calldata
 * 3. Sign TX with user's PKP
 * 4. Broadcast to chain
 *
 * Required jsParams:
 * - userPkpPublicKey: User's PKP public key (signs and pays gas)
 * - encAge: FHE-encrypted age (hex string, client-encrypted)
 * - encGenderId: FHE-encrypted gender ID (hex string, client-encrypted)
 * - encDesiredMask: FHE-encrypted desired mask (hex string, client-encrypted)
 * - encShareAge: FHE-encrypted shareAge bool (hex string, client-encrypted)
 * - encShareGender: FHE-encrypted shareGender bool (hex string, client-encrypted)
 * - proof: FHE proof bytes (hex string)
 *
 * Optional jsParams:
 * - dryRun: boolean (skip broadcast, return signedTx)
 * - chainId: number (override chain ID, default 11155111 Sepolia)
 * - contractAddress: string (override contract address)
 *
 * Returns: { success: true, txHash: string } or { success: false, error: string }
 */

// Default to Sepolia (Zama fhEVM testnet)
const DEFAULT_CHAIN_ID = 11155111;
const DEFAULT_CHAIN_NAME = "sepolia";
const DEFAULT_CONTRACT_ADDRESS = "0x1282fF4F33eFA67ea4f85E462F5D73e2cfF25b07";

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

const toBigNumber = (value, label) => {
  if (typeof value === "bigint") return ethers.BigNumber.from(value.toString());
  if (typeof value === "number") return ethers.BigNumber.from(value);
  if (typeof value === "string") return ethers.BigNumber.from(value);
  throw new Error(`Invalid ${label}`);
};

// ============================================================
// MAIN
// ============================================================

const main = async () => {
  try {
    const {
      userPkpPublicKey,
      encAge,
      encGenderId,
      encDesiredMask,
      encShareAge,
      encShareGender,
      proof,
      dryRun = false,
      chainId = DEFAULT_CHAIN_ID,
      contractAddress = DEFAULT_CONTRACT_ADDRESS,
    } = jsParams || {};

    must(userPkpPublicKey, "userPkpPublicKey");
    must(encAge, "encAge");
    must(encGenderId, "encGenderId");
    must(encDesiredMask, "encDesiredMask");
    must(encShareAge, "encShareAge");
    must(encShareGender, "encShareGender");
    must(proof, "proof");

    // Validate hex strings
    const encAgeHex = ensure0x(encAge);
    const encGenderIdHex = ensure0x(encGenderId);
    const encDesiredMaskHex = ensure0x(encDesiredMask);
    const encShareAgeHex = ensure0x(encShareAge);
    const encShareGenderHex = ensure0x(encShareGender);
    const proofHex = ensure0x(proof);

    if (!isHexString(encAgeHex)) throw new Error("encAge must be a hex string");
    if (!isHexString(encGenderIdHex)) throw new Error("encGenderId must be a hex string");
    if (!isHexString(encDesiredMaskHex)) throw new Error("encDesiredMask must be a hex string");
    if (!isHexString(encShareAgeHex)) throw new Error("encShareAge must be a hex string");
    if (!isHexString(encShareGenderHex)) throw new Error("encShareGender must be a hex string");
    if (!isHexString(proofHex)) throw new Error("proof must be a hex string");

    const userAddress = ethers.utils.computeAddress(userPkpPublicKey);
    const resolvedChainId = Number(chainId);

    // Build setBasics calldata
    // function setBasics(
    //   externalEuint8 claimedAge,
    //   externalEuint8 genderId,
    //   externalEuint16 desiredMask,
    //   externalEbool shareAge,
    //   externalEbool shareGender,
    //   bytes calldata proof
    // )
    //
    // externalEuint8/16/ebool are just bytes32 handles passed to the contract
    const iface = new ethers.utils.Interface([
      "function setBasics(bytes32 claimedAge, bytes32 genderId, bytes32 desiredMask, bytes32 shareAge, bytes32 shareGender, bytes proof)",
    ]);

    const txData = iface.encodeFunctionData("setBasics", [
      ethers.utils.hexZeroPad(encAgeHex, 32),
      ethers.utils.hexZeroPad(encGenderIdHex, 32),
      ethers.utils.hexZeroPad(encDesiredMaskHex, 32),
      ethers.utils.hexZeroPad(encShareAgeHex, 32),
      ethers.utils.hexZeroPad(encShareGenderHex, 32),
      proofHex,
    ]);

    // Get TX params (runOnce ensures only one node does RPC)
    const chainName = resolvedChainId === 11155111 ? "sepolia" : DEFAULT_CHAIN_NAME;

    const txParamsJson = await Lit.Actions.runOnce(
      { waitForResponse: true, name: "getTxParams" },
      async () => {
        const endpoint = await Lit.Actions.getRpcUrl({ chain: chainName });
        const provider = new ethers.providers.JsonRpcProvider(endpoint);

        const [nonce, feeData, gasEstimate] = await Promise.all([
          provider.getTransactionCount(userAddress, "pending"),
          provider.getFeeData(),
          provider.estimateGas({
            from: userAddress,
            to: contractAddress,
            data: txData,
          }).catch(() => ethers.BigNumber.from(500000)), // fallback gas for FHE ops
        ]);

        const gasLimit = gasEstimate.mul(150).div(100); // 50% buffer for FHE
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || feeData.gasPrice;
        const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice;

        return JSON.stringify({
          nonce: nonce.toString(),
          gasLimit: gasLimit.toString(),
          maxFeePerGas: maxFeePerGas?.toString() || "0",
          maxPriorityFeePerGas: maxPriorityFeePerGas?.toString() || "0",
        });
      }
    );

    const txParams = JSON.parse(txParamsJson);

    const unsignedTx = {
      type: 2,
      chainId: resolvedChainId,
      nonce: toBigNumber(txParams.nonce, "nonce"),
      to: contractAddress,
      data: txData,
      gasLimit: toBigNumber(txParams.gasLimit, "gasLimit"),
      maxFeePerGas: toBigNumber(txParams.maxFeePerGas, "maxFeePerGas"),
      maxPriorityFeePerGas: toBigNumber(txParams.maxPriorityFeePerGas, "maxPriorityFeePerGas"),
      value: 0,
    };

    // Sign with user's PKP
    const txHash = ethers.utils.keccak256(ethers.utils.serializeTransaction(unsignedTx));

    const sigResult = await Lit.Actions.signAndCombineEcdsa({
      toSign: Array.from(ethers.utils.arrayify(txHash)),
      publicKey: userPkpPublicKey,
      sigName: "setBasicsTxSig",
    });

    const sigObj = JSON.parse(sigResult);
    let v = Number(sigObj.recid ?? sigObj.recoveryId ?? sigObj.v);
    if (v === 0 || v === 1) v += 27;
    const sig = ethers.utils.joinSignature({
      r: `0x${strip0x(sigObj.r)}`,
      s: `0x${strip0x(sigObj.s)}`,
      v,
    });

    const signedTx = ethers.utils.serializeTransaction(unsignedTx, sig);

    if (dryRun) {
      Lit.Actions.setResponse({
        response: JSON.stringify({
          success: true,
          version: "dating-setbasics-v1",
          dryRun: true,
          signedTx,
          txHash,
          user: userAddress,
          contract: contractAddress,
          chainId: resolvedChainId,
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
        version: "dating-setbasics-v1",
        txHash: broadcastTxHash,
        user: userAddress,
        contract: contractAddress,
        chainId: resolvedChainId,
      }),
    });
  } catch (e) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: false,
        version: "dating-setbasics-v1",
        error: e?.message || String(e),
      }),
    });
  }
};

main();
