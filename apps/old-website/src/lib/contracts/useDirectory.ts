/**
 * useDirectory - Hook for reading/writing profiles from Directory contract
 */

import { createSignal, createResource, type Accessor } from 'solid-js'
import type { Address, Hex, TransactionSerializable } from 'viem'
import { sepolia } from 'viem/chains'
import { encodeFunctionData } from 'viem'
import {
  wagmiConfig,
  writeContract,
  waitForTransactionReceipt,
  switchChain,
  getAccount,
} from '@/providers/Web3Provider'
import {
  publicClient,
  CONTRACTS,
  directoryAbi,
  type DirectoryProfile,
  AGE_BUCKETS,
  GENDER_LABELS,
  REGION_LABELS,
  LOOKING_FOR_LABELS,
  isDatingInitialized,
} from './config'
import type { PKPInfo, AuthData } from '@/lib/lit/types'

// Extended profile with address for UI
export interface ProfileWithAddress extends DirectoryProfile {
  address: Address
  // Dating contract status
  datingInitialized: boolean
  // Computed display fields (undefined if hidden)
  ageLabel: string | undefined
  genderLabel: string | undefined
  regionLabel: string | undefined
  lookingForLabel: string | undefined
}

/**
 * Fetch a single profile by address
 */
export async function getProfile(address: Address): Promise<DirectoryProfile | null> {
  try {
    const profile = await publicClient.readContract({
      address: CONTRACTS.directory,
      abi: directoryAbi,
      functionName: 'getProfile',
      args: [address],
    })
    return profile.exists ? profile : null
  } catch (e) {
    console.error('Failed to fetch profile:', e)
    return null
  }
}

/**
 * Fetch profile count
 */
export async function getProfileCount(): Promise<number> {
  try {
    const count = await publicClient.readContract({
      address: CONTRACTS.directory,
      abi: directoryAbi,
      functionName: 'getProfileCount',
    })
    return Number(count)
  } catch (e) {
    console.error('Failed to fetch profile count:', e)
    return 0
  }
}

/**
 * Fetch profile address by index
 */
export async function getProfileAddress(index: number): Promise<Address | null> {
  try {
    return await publicClient.readContract({
      address: CONTRACTS.directory,
      abi: directoryAbi,
      functionName: 'getProfileAddress',
      args: [BigInt(index)],
    })
  } catch (e) {
    console.error('Failed to fetch profile address:', e)
    return null
  }
}

/**
 * Transform raw profile to UI-ready format
 * Hidden fields (value=0) return undefined instead of labels
 */
function enrichProfile(
  profile: DirectoryProfile,
  address: Address,
  datingInitialized: boolean
): ProfileWithAddress {
  return {
    ...profile,
    address,
    datingInitialized,
    // Return undefined for hidden (0) values, otherwise the label
    ageLabel: profile.ageBucket ? AGE_BUCKETS[profile.ageBucket] : undefined,
    genderLabel: profile.genderIdentity ? GENDER_LABELS[profile.genderIdentity] : undefined,
    regionLabel: profile.regionBucket ? REGION_LABELS[profile.regionBucket] : undefined,
    lookingForLabel: profile.lookingFor ? LOOKING_FOR_LABELS[profile.lookingFor] : undefined,
  }
}

/**
 * Fetch multiple profiles with pagination
 * Also checks Dating.profileInitialized for each profile
 */
export async function fetchProfiles(
  startIndex: number = 0,
  limit: number = 10
): Promise<ProfileWithAddress[]> {
  const count = await getProfileCount()
  if (count === 0) return []

  const profiles: ProfileWithAddress[] = []
  const endIndex = Math.min(startIndex + limit, count)

  for (let i = startIndex; i < endIndex; i++) {
    const address = await getProfileAddress(i)
    if (!address) continue

    const [profile, datingInit] = await Promise.all([
      getProfile(address),
      isDatingInitialized(address),
    ])

    if (profile && profile.exists) {
      profiles.push(enrichProfile(profile, address, datingInit))
    }
  }

  return profiles
}

/**
 * SolidJS hook for directory profiles
 */
export function useDirectory() {
  const [profiles, setProfiles] = createSignal<ProfileWithAddress[]>([])
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [totalCount, setTotalCount] = createSignal(0)

  const loadProfiles = async (startIndex = 0, limit = 10) => {
    setLoading(true)
    setError(null)

    try {
      const count = await getProfileCount()
      setTotalCount(count)

      const fetched = await fetchProfiles(startIndex, limit)
      setProfiles(fetched)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  const refreshProfiles = () => loadProfiles()

  return {
    profiles,
    loading,
    error,
    totalCount,
    loadProfiles,
    refreshProfiles,
  }
}

/**
 * Create a resource for a single profile (reactive)
 */
export function createProfileResource(address: Accessor<Address | null>) {
  return createResource(address, async (addr) => {
    if (!addr) return null
    const [profile, datingInit] = await Promise.all([
      getProfile(addr),
      isDatingInitialized(addr),
    ])
    return profile ? enrichProfile(profile, addr, datingInit) : null
  })
}

// ============ WRITE FUNCTIONS ============

/**
 * Parameters for registering/updating a profile
 * All fields use 0=hidden encoding
 */
export interface RegisterProfileParams {
  animeCid?: Hex        // bytes32 - IPFS CID for anime avatar (or 0x0)
  encPhotoCid?: Hex     // bytes32 - encrypted photo CID (or 0x0)
  regionBucket: number  // 0=hidden, 1-9 = regions
  genderIdentity: number // 0=hidden, 1-5 = gender
  bodyBucket?: number   // 0=hidden, 1-5 = body type
  fitnessBucket?: number // 0=hidden, 1-5 = fitness
  smoking?: number      // 0=hidden, 1-3 = smoking
  drinking?: number     // 0=hidden, 1-3 = drinking
  lookingFor: number    // 0=hidden, 1-3 = looking for
  modelVersion?: number // Schema version (default 1)
}

/**
 * Zero bytes32 for empty CIDs
 */
const ZERO_BYTES32: Hex = '0x0000000000000000000000000000000000000000000000000000000000000000'

/**
 * Options for registering a profile - can use EOA (wagmi) or PKP signing
 */
export interface RegisterOptions {
  /** PKP info for PKP-based signing (no EOA wallet needed) */
  pkpInfo?: PKPInfo
  /** Auth data for PKP signing */
  authData?: AuthData
}

/**
 * Register or update a profile on the Directory contract
 * Supports both EOA (wagmi) and PKP (Lit Protocol) signing
 *
 * @param params Profile data to write
 * @param options Optional PKP info for PKP-based signing
 * @returns Transaction hash
 * @throws Error if neither wallet nor PKP is available
 */
export async function registerProfile(
  params: RegisterProfileParams,
  options?: RegisterOptions
): Promise<Hex> {
  const account = getAccount(wagmiConfig)
  const hasPkp = options?.pkpInfo && options?.authData

  // Check if we have any signing method available
  if (!account.address && !hasPkp) {
    throw new Error('No signing method available. Connect a wallet or use passkey authentication.')
  }

  console.log('[Directory] registerOrUpdateProfile with params:', params)
  console.log('[Directory] Signing method:', account.address ? 'EOA (wagmi)' : 'PKP (Lit)')

  // Prepare the function args
  const args = [
    params.animeCid ?? ZERO_BYTES32,
    params.encPhotoCid ?? ZERO_BYTES32,
    params.regionBucket,
    params.genderIdentity,
    params.bodyBucket ?? 0,
    params.fitnessBucket ?? 0,
    params.smoking ?? 0,
    params.drinking ?? 0,
    params.lookingFor,
    params.modelVersion ?? 1,
  ] as const

  // If we have an EOA wallet connected, use wagmi
  if (account.address) {
    // Ensure we're on Sepolia (where contracts are deployed)
    if (account.chainId !== sepolia.id) {
      console.log(`Switching to Sepolia...`)
      await switchChain(wagmiConfig, { chainId: sepolia.id })
    }

    const hash = await writeContract(wagmiConfig, {
      address: CONTRACTS.directory,
      abi: directoryAbi,
      functionName: 'registerOrUpdateProfile',
      args,
      chain: sepolia,
    })

    console.log('[Directory] Transaction submitted:', hash)

    // Wait for confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, { hash })
    console.log('[Directory] Transaction confirmed:', receipt.status)

    if (receipt.status === 'reverted') {
      throw new Error('Transaction reverted')
    }

    return hash
  }

  // Use PKP signing
  if (!hasPkp) {
    throw new Error('PKP info required for PKP signing')
  }

  // Lazy load Lit signing to avoid bundle bloat
  const { signTransactionWithPKP } = await import('@/lib/lit')

  const pkpAddress = options.pkpInfo!.ethAddress

  // Get nonce and gas estimates
  const [nonce, gasPrice, gasEstimate] = await Promise.all([
    publicClient.getTransactionCount({ address: pkpAddress }),
    publicClient.getGasPrice(),
    publicClient.estimateGas({
      account: pkpAddress,
      to: CONTRACTS.directory,
      data: encodeFunctionData({
        abi: directoryAbi,
        functionName: 'registerOrUpdateProfile',
        args,
      }),
    }),
  ])

  // Build unsigned transaction (EIP-1559)
  const unsignedTx: TransactionSerializable = {
    type: 'eip1559',
    chainId: sepolia.id,
    nonce,
    to: CONTRACTS.directory,
    data: encodeFunctionData({
      abi: directoryAbi,
      functionName: 'registerOrUpdateProfile',
      args,
    }),
    maxFeePerGas: gasPrice * 2n, // 2x current gas price for buffer
    maxPriorityFeePerGas: gasPrice / 10n, // ~10% priority fee
    gas: (gasEstimate * 120n) / 100n, // 20% buffer
  }

  console.log('[Directory] Built unsigned tx:', unsignedTx)

  // Sign with PKP
  const signedTx = await signTransactionWithPKP(
    options.pkpInfo!,
    options.authData!,
    unsignedTx
  )

  console.log('[Directory] Signed transaction, broadcasting...')

  // Broadcast
  const hash = await publicClient.sendRawTransaction({
    serializedTransaction: signedTx,
  })

  console.log('[Directory] Transaction submitted:', hash)

  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('[Directory] Transaction confirmed:', receipt.status)

  if (receipt.status === 'reverted') {
    throw new Error('Transaction reverted')
  }

  return hash
}

/**
 * Hook for writing to Directory contract
 * Supports both EOA (wagmi) and PKP (Lit Protocol) signing
 */
export function useWriteDirectory() {
  const [isWriting, setIsWriting] = createSignal(false)
  const [writeError, setWriteError] = createSignal<string | null>(null)
  const [txHash, setTxHash] = createSignal<Hex | null>(null)

  /**
   * Register a profile
   * @param params Profile data
   * @param options Optional PKP info for passkey-based signing
   */
  const register = async (params: RegisterProfileParams, options?: RegisterOptions) => {
    setIsWriting(true)
    setWriteError(null)
    setTxHash(null)

    try {
      const hash = await registerProfile(params, options)
      setTxHash(hash)
      return hash
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to register profile'
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
