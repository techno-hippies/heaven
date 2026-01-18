/**
 * Survey Registry Sponsor v1
 *
 * Signs and broadcasts SurveyRegistry.registerFor(...) using a funded service PKP.
 * This action is restricted to a single registry contract and chain.
 *
 * Required jsParams:
 * - user: address (user PKP address)
 * - surveyId: 0x-prefixed bytes32
 * - cid: string (IPFS CID)
 * - encryptionMode: number (0-2)
 * - deadline: unix timestamp (seconds)
 * - userSig: 0x-prefixed signature (65 bytes)
 *
 * Optional jsParams:
 * - dryRun: boolean (skip broadcast, return signedTx)
 */

const CHAIN_NAME = 'baseSepolia';
const CHAIN_ID = 84532;
const REGISTRY_ADDRESS = '0xdf9ed085cf7f676ccce760c219ce118ab38ce8ca';

// Sponsor PKP - fund this address with Base Sepolia ETH
const PKP_PUBLIC_KEY = '0x044615ca5ec3bfec5f5306f62ccc1a398cbd7e9cc53ac0e715b27ba81272e7397b185aa6f43c9bb2f0d9c489d30478cec9310685cd3a33922c0d12417b6375bc08';
const PKP_ETH_ADDRESS = '0x089fc7801D8f7D487765343a7946b1b97A7d29D4';

const strip0x = (value) => {
  const v = String(value || '');
  return v.startsWith('0x') ? v.slice(2) : v;
};

const isHexString = (value) => /^0x[0-9a-fA-F]+$/.test(value || '');
const isBytes32 = (value) => /^0x[0-9a-fA-F]{64}$/.test(value || '');
const isAddress = (value) => /^0x[0-9a-fA-F]{40}$/.test(value || '');
const isSignature = (value) => /^0x[0-9a-fA-F]{130}$/.test(value || '');

const toBigNumber = (ethers, value, label) => {
  if (typeof value === 'bigint') return ethers.BigNumber.from(value.toString());
  if (typeof value === 'number') return ethers.BigNumber.from(value);
  if (typeof value === 'string') return ethers.BigNumber.from(value);
  throw new Error(`Invalid ${label}`);
};

const getEthers = () => {
  const ethers = globalThis.ethers;
  if (!ethers) {
    throw new Error('ethers is not available in this Lit Action runtime');
  }
  return ethers;
};

const go = async () => {
  try {
    const ethers = getEthers();

    if (!isHexString(PKP_PUBLIC_KEY) || PKP_PUBLIC_KEY.includes('REPLACE_')) {
      throw new Error('PKP_PUBLIC_KEY not configured');
    }
    if (!isAddress(PKP_ETH_ADDRESS) || PKP_ETH_ADDRESS.includes('REPLACE_')) {
      throw new Error('PKP_ETH_ADDRESS not configured');
    }

    const {
      user,
      surveyId,
      schemaIdBytes32,
      cid,
      encryptionMode,
      deadline,
      userSig,
      dryRun = false,
    } = jsParams || {};

    const resolvedSurveyId = surveyId || schemaIdBytes32;

    if (!isAddress(user)) {
      throw new Error('user must be a 0x-prefixed address');
    }
    if (!isBytes32(resolvedSurveyId)) {
      throw new Error('surveyId must be a 0x-prefixed bytes32');
    }
    if (!cid || typeof cid !== 'string') {
      throw new Error('cid is required');
    }
    const mode = Number(encryptionMode);
    if (!Number.isInteger(mode) || mode < 0 || mode > 2) {
      throw new Error('encryptionMode must be 0-2');
    }
    if (!deadline || !Number.isFinite(Number(deadline))) {
      throw new Error('deadline must be a unix timestamp in seconds');
    }
    if (!isSignature(userSig)) {
      throw new Error('userSig must be a 65-byte hex signature');
    }

    const iface = new ethers.utils.Interface([
      'function registerFor(address user, bytes32 surveyId, string cid, uint8 encryptionMode, uint256 deadline, bytes sig)'
    ]);

    const data = iface.encodeFunctionData('registerFor', [
      user,
      resolvedSurveyId,
      cid,
      mode,
      deadline,
      userSig,
    ]);

    const txParamsJson = await Lit.Actions.runOnce(
      { waitForResponse: true, name: 'surveyRegisterTxParams' },
      async () => {
        const endpoint = await Lit.Actions.getRpcUrl({ chain: CHAIN_NAME });
        const provider = new ethers.providers.JsonRpcProvider(endpoint);
        const [nonce, feeData, gasEstimate] = await Promise.all([
          provider.getTransactionCount(PKP_ETH_ADDRESS, 'pending'),
          provider.getFeeData(),
          provider.estimateGas({
            from: PKP_ETH_ADDRESS,
            to: REGISTRY_ADDRESS,
            data,
          }),
        ]);

        const gasLimit = gasEstimate.mul(120).div(100);
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || feeData.gasPrice;
        const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice;

        if (!maxFeePerGas || !maxPriorityFeePerGas) {
          throw new Error('Failed to fetch fee data');
        }

        return JSON.stringify({
          nonce: nonce.toString(),
          gasLimit: gasLimit.toString(),
          maxFeePerGas: maxFeePerGas.toString(),
          maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
        });
      }
    );

    const resolvedParams = JSON.parse(txParamsJson);

    const nonce = toBigNumber(ethers, resolvedParams.nonce, 'nonce');
    const gasLimit = toBigNumber(
      ethers,
      resolvedParams.gasLimit ?? resolvedParams.gas,
      'gasLimit'
    );
    const maxFeePerGas = toBigNumber(ethers, resolvedParams.maxFeePerGas, 'maxFeePerGas');
    const maxPriorityFeePerGas = toBigNumber(
      ethers,
      resolvedParams.maxPriorityFeePerGas,
      'maxPriorityFeePerGas'
    );

    const unsignedTx = {
      type: 2,
      chainId: CHAIN_ID,
      nonce,
      to: REGISTRY_ADDRESS,
      data,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      value: 0,
    };

    const txHash = ethers.utils.keccak256(ethers.utils.serializeTransaction(unsignedTx));
    const toSign = Array.from(ethers.utils.arrayify(txHash));

    const signature = await Lit.Actions.signAndCombineEcdsa({
      toSign,
      publicKey: PKP_PUBLIC_KEY,
      sigName: 'surveyTxSig',
    });

    const sigObj = JSON.parse(signature);
    const r = `0x${strip0x(sigObj.r)}`;
    const s = `0x${strip0x(sigObj.s)}`;
    let v = Number(sigObj.recoveryId ?? sigObj.recid ?? sigObj.v);
    if (Number.isNaN(v)) {
      throw new Error('Invalid signature recovery id');
    }
    if (v === 0 || v === 1) {
      v += 27;
    }

    const joinedSig = ethers.utils.joinSignature({ r, s, v });
    const signedTx = ethers.utils.serializeTransaction(unsignedTx, joinedSig);

    if (dryRun) {
      Lit.Actions.setResponse({
        response: JSON.stringify({
          ok: true,
          dryRun: true,
          signedTx,
          txHash,
          signer: PKP_ETH_ADDRESS,
          registry: REGISTRY_ADDRESS,
          chainId: CHAIN_ID,
        }),
      });
      return;
    }

    const sendResult = await Lit.Actions.runOnce(
      { waitForResponse: true, name: 'broadcastSurveyRegister' },
      async () => {
        const endpoint = await Lit.Actions.getRpcUrl({ chain: CHAIN_NAME });
        const provider = new ethers.providers.JsonRpcProvider(endpoint);
        const tx = await provider.sendTransaction(signedTx);
        return tx.hash;
      }
    );

    Lit.Actions.setResponse({
      response: JSON.stringify({
        ok: true,
        txHash: sendResult,
        signer: PKP_ETH_ADDRESS,
        registry: REGISTRY_ADDRESS,
        chainId: CHAIN_ID,
      }),
    });
  } catch (error) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        ok: false,
        error: error && error.message ? error.message : String(error),
      }),
    });
  }
};

go();
