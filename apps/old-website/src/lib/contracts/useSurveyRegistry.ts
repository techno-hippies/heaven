/**
 * useSurveyRegistry - Hook for reading/writing to SurveyRegistry on Base Sepolia
 */

import { createSignal } from 'solid-js'
import {
  createPublicClient,
  http,
  encodeFunctionData,
  hashTypedData,
  keccak256,
  toBytes,
  type Address,
  type Hex,
  type TransactionSerializable,
} from 'viem'
import { baseSepolia } from 'viem/chains'
import {
  wagmiConfig,
  writeContract,
  waitForTransactionReceipt,
  switchChain,
  getAccount,
} from '@/providers/Web3Provider'
import type { PKPInfo, AuthData } from '@/lib/lit/types'

// ============ Config ============

// SurveyRegistry is on Base Sepolia (chainId 84532) - cheaper than L1
export const SURVEY_REGISTRY_ADDRESS = (
  import.meta.env.VITE_SURVEY_REGISTRY_ADDRESS || '0x2B404ecA5060966591f7B60e879C6CE8014BD62A'
) as Address

const SURVEY_SPONSOR_ACTION_CID = import.meta.env.VITE_SURVEY_SPONSOR_CID || ''
const SURVEY_SPONSOR_DEADLINE_SEC = 15 * 60

// Base Sepolia public client
export const baseSepliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'),
})

// ============ ABI ============

export const surveyRegistryAbi = [
  // Write
  {
    inputs: [
      { name: 'schemaIdBytes32', type: 'bytes32' },
      { name: 'responseCid', type: 'string' },
      { name: 'encryptionMode', type: 'uint8' },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'surveyId', type: 'bytes32' },
      { name: 'cid', type: 'string' },
      { name: 'encryptionMode', type: 'uint8' },
      { name: 'deadline', type: 'uint256' },
      { name: 'sig', type: 'bytes' },
    ],
    name: 'registerFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'schemaIdBytes32', type: 'bytes32' }],
    name: 'deleteSurvey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Read
  {
    inputs: [
      { name: 'wallet', type: 'address' },
      { name: 'schemaIdBytes32', type: 'bytes32' },
    ],
    name: 'getSurvey',
    outputs: [
      { name: 'responseCid', type: 'string' },
      { name: 'encryptionMode', type: 'uint8' },
      { name: 'updatedAt', type: 'uint64' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'wallet', type: 'address' },
      { name: 'schemaIdBytes32', type: 'bytes32' },
    ],
    name: 'hasSurvey',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'wallet', type: 'address' }],
    name: 'getActiveSchemas',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'wallet', type: 'address' }],
    name: 'getSchemaCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ============ Types ============

export interface SurveyRegistryEntry {
  responseCid: string
  encryptionMode: number
  updatedAt: number
}

export interface RegisterSurveyParams {
  schemaIdBytes32: Hex
  responseCid: string
  encryptionMode: number
}

export interface SurveyRegisterOptions {
  pkpInfo?: PKPInfo
  authData?: AuthData
}

// ============ Read Functions ============

/**
 * Get survey entry for a wallet + schema
 */
export async function getSurvey(
  wallet: Address,
  schemaIdBytes32: Hex
): Promise<SurveyRegistryEntry | null> {
  try {
    const [responseCid, encryptionMode, updatedAt] = await baseSepliaClient.readContract({
      address: SURVEY_REGISTRY_ADDRESS,
      abi: surveyRegistryAbi,
      functionName: 'getSurvey',
      args: [wallet, schemaIdBytes32],
    })

    if (!responseCid) return null

    return {
      responseCid,
      encryptionMode,
      updatedAt: Number(updatedAt),
    }
  } catch (e) {
    console.error('[SurveyRegistry] Failed to get survey:', e)
    return null
  }
}

/**
 * Check if wallet has an active survey for schema
 */
export async function hasSurvey(wallet: Address, schemaIdBytes32: Hex): Promise<boolean> {
  try {
    return await baseSepliaClient.readContract({
      address: SURVEY_REGISTRY_ADDRESS,
      abi: surveyRegistryAbi,
      functionName: 'hasSurvey',
      args: [wallet, schemaIdBytes32],
    })
  } catch (e) {
    console.error('[SurveyRegistry] Failed to check hasSurvey:', e)
    return false
  }
}

/**
 * Get all active schema IDs for a wallet
 */
export async function getActiveSchemas(wallet: Address): Promise<Hex[]> {
  try {
    return await baseSepliaClient.readContract({
      address: SURVEY_REGISTRY_ADDRESS,
      abi: surveyRegistryAbi,
      functionName: 'getActiveSchemas',
      args: [wallet],
    }) as Hex[]
  } catch (e) {
    console.error('[SurveyRegistry] Failed to get active schemas:', e)
    return []
  }
}

/**
 * Get count of active surveys for a wallet
 */
export async function getSchemaCount(wallet: Address): Promise<number> {
  try {
    const count = await baseSepliaClient.readContract({
      address: SURVEY_REGISTRY_ADDRESS,
      abi: surveyRegistryAbi,
      functionName: 'getSchemaCount',
      args: [wallet],
    })
    return Number(count)
  } catch (e) {
    console.error('[SurveyRegistry] Failed to get schema count:', e)
    return 0
  }
}

// ============ Write Functions ============

const REGISTER_TYPED_DATA = {
  domain: {
    name: 'SurveyRegistry',
    version: '1',
    chainId: baseSepolia.id,
    verifyingContract: SURVEY_REGISTRY_ADDRESS,
  },
  types: {
    Register: [
      { name: 'user', type: 'address' },
      { name: 'surveyId', type: 'bytes32' },
      { name: 'cidHash', type: 'bytes32' },
      { name: 'encryptionMode', type: 'uint8' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
  primaryType: 'Register',
} as const

async function registerSurveySponsored(
  params: RegisterSurveyParams,
  options: SurveyRegisterOptions
): Promise<Hex> {
  const pkpInfo = options.pkpInfo!
  const authData = options.authData!
  const userAddress = pkpInfo.ethAddress

  const nonce = await baseSepliaClient.readContract({
    address: SURVEY_REGISTRY_ADDRESS,
    abi: surveyRegistryAbi,
    functionName: 'nonces',
    args: [userAddress],
  })

  const deadline = BigInt(Math.floor(Date.now() / 1000) + SURVEY_SPONSOR_DEADLINE_SEC)
  const cidHash = keccak256(toBytes(params.responseCid))

  const digest = hashTypedData({
    domain: REGISTER_TYPED_DATA.domain,
    types: REGISTER_TYPED_DATA.types,
    primaryType: REGISTER_TYPED_DATA.primaryType,
    message: {
      user: userAddress,
      surveyId: params.schemaIdBytes32,
      cidHash,
      encryptionMode: params.encryptionMode,
      nonce: nonce as bigint,
      deadline,
    },
  })

  const { signDigestWithPKP, getLitClient, createPKPAuthContext } = await import('@/lib/lit')

  const userSig = await signDigestWithPKP(pkpInfo, authData, digest)
  const authContext = await createPKPAuthContext(pkpInfo, authData)
  const litClient = await getLitClient()

  const result = await litClient.executeJs({
    ipfsId: SURVEY_SPONSOR_ACTION_CID,
    authContext,
    jsParams: {
      user: userAddress,
      surveyId: params.schemaIdBytes32,
      cid: params.responseCid,
      encryptionMode: params.encryptionMode,
      deadline: deadline.toString(),
      userSig,
    },
  })

  let responsePayload: { ok?: boolean; txHash?: Hex; error?: string } | null = null

  if (typeof result.response === 'string') {
    try {
      responsePayload = JSON.parse(result.response)
    } catch (error) {
      console.error('[SurveyRegistry] Invalid sponsor response:', error)
    }
  } else if (result.response && typeof result.response === 'object') {
    responsePayload = result.response as { ok?: boolean; txHash?: Hex; error?: string }
  }

  if (!responsePayload?.ok || !responsePayload?.txHash) {
    throw new Error(responsePayload?.error || 'Sponsored transaction failed')
  }

  return responsePayload.txHash as Hex
}

/**
 * Register a survey response on-chain
 * Supports both EOA (wagmi) and PKP (Lit Protocol) signing
 */
export async function registerSurvey(
  params: RegisterSurveyParams,
  options?: SurveyRegisterOptions
): Promise<Hex> {
  const account = getAccount(wagmiConfig)
  const hasPkp = options?.pkpInfo && options?.authData

  if (!account.address && !hasPkp) {
    throw new Error('No signing method available. Connect a wallet or use passkey authentication.')
  }

  console.log('[SurveyRegistry] Registering survey:', {
    schemaIdBytes32: params.schemaIdBytes32,
    responseCid: params.responseCid,
    encryptionMode: params.encryptionMode,
  })

  const args = [
    params.schemaIdBytes32,
    params.responseCid,
    params.encryptionMode,
  ] as const

  // Use EOA if available
  if (account.address) {
    // Switch to Base Sepolia
    if (account.chainId !== baseSepolia.id) {
      console.log('[SurveyRegistry] Switching to Base Sepolia...')
      await switchChain(wagmiConfig, { chainId: baseSepolia.id })
    }

    const hash = await writeContract(wagmiConfig, {
      address: SURVEY_REGISTRY_ADDRESS,
      abi: surveyRegistryAbi,
      functionName: 'register',
      args,
      chain: baseSepolia,
    })

    console.log('[SurveyRegistry] Transaction submitted:', hash)

    const receipt = await waitForTransactionReceipt(wagmiConfig, { hash })
    console.log('[SurveyRegistry] Transaction confirmed:', receipt.status)

    if (receipt.status === 'reverted') {
      throw new Error('Transaction reverted')
    }

    return hash
  }

  // Use PKP signing
  if (!hasPkp) {
    throw new Error('PKP info required for PKP signing')
  }

  if (SURVEY_SPONSOR_ACTION_CID) {
    console.log('[SurveyRegistry] Using sponsored registerFor flow')
    return registerSurveySponsored(params, options!)
  }

  const { signTransactionWithPKP } = await import('@/lib/lit')
  const pkpAddress = options!.pkpInfo!.ethAddress

  // Get nonce and gas estimates from Base Sepolia
  const [nonce, gasPrice, gasEstimate] = await Promise.all([
    baseSepliaClient.getTransactionCount({ address: pkpAddress }),
    baseSepliaClient.getGasPrice(),
    baseSepliaClient.estimateGas({
      account: pkpAddress,
      to: SURVEY_REGISTRY_ADDRESS,
      data: encodeFunctionData({
        abi: surveyRegistryAbi,
        functionName: 'register',
        args,
      }),
    }),
  ])

  const unsignedTx: TransactionSerializable = {
    type: 'eip1559',
    chainId: baseSepolia.id,
    nonce,
    to: SURVEY_REGISTRY_ADDRESS,
    data: encodeFunctionData({
      abi: surveyRegistryAbi,
      functionName: 'register',
      args,
    }),
    maxFeePerGas: gasPrice * 2n,
    maxPriorityFeePerGas: gasPrice / 10n,
    gas: (gasEstimate * 120n) / 100n,
  }

  console.log('[SurveyRegistry] Built unsigned tx:', unsignedTx)

  const signedTx = await signTransactionWithPKP(
    options!.pkpInfo!,
    options!.authData!,
    unsignedTx
  )

  console.log('[SurveyRegistry] Signed transaction, broadcasting...')

  const hash = await baseSepliaClient.sendRawTransaction({
    serializedTransaction: signedTx,
  })

  console.log('[SurveyRegistry] Transaction submitted:', hash)

  const receipt = await baseSepliaClient.waitForTransactionReceipt({ hash })
  console.log('[SurveyRegistry] Transaction confirmed:', receipt.status)

  if (receipt.status === 'reverted') {
    throw new Error('Transaction reverted')
  }

  return hash
}

// ============ Hook ============

/**
 * Hook for writing to SurveyRegistry
 */
export function useWriteSurveyRegistry() {
  const [isWriting, setIsWriting] = createSignal(false)
  const [writeError, setWriteError] = createSignal<string | null>(null)
  const [txHash, setTxHash] = createSignal<Hex | null>(null)

  const register = async (params: RegisterSurveyParams, options?: SurveyRegisterOptions) => {
    setIsWriting(true)
    setWriteError(null)
    setTxHash(null)

    try {
      const hash = await registerSurvey(params, options)
      setTxHash(hash)
      return hash
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to register survey'
      setWriteError(message)
      throw e
    } finally {
      setIsWriting(false)
    }
  }

  return {
    register,
    isWriting,
    writeError,
    txHash,
  }
}
