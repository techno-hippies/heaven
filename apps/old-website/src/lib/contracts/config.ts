/**
 * Contract configuration for Neodate
 *
 * Deployed on Sepolia (chainId 11155111) with Zama fhEVM coprocessor
 */

import { createPublicClient, http, type Address, type Chain } from 'viem'
import { sepolia, mainnet } from 'viem/chains'

// Contract addresses from deployment
export const CONTRACTS = {
  directory: import.meta.env.VITE_DIRECTORY_ADDRESS as Address,
  dating: import.meta.env.VITE_DATING_ADDRESS as Address,
  partnerLink: import.meta.env.VITE_PARTNERLINK_ADDRESS as Address,
} as const

// Chain config
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111)
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'

// Supported chains
const CHAINS: Record<number, Chain> = {
  1: mainnet,
  11155111: sepolia,
}

function getChain(chainId: number): Chain {
  const chain = CHAINS[chainId]
  if (!chain) {
    console.warn(`Unknown chainId ${chainId}, falling back to sepolia`)
    return sepolia
  }
  return chain
}

// Public client for read operations
export const publicClient = createPublicClient({
  chain: getChain(CHAIN_ID),
  transport: http(RPC_URL),
})

// Directory ABI (read + write functions)
export const directoryAbi = [
  // Write functions
  {
    inputs: [
      { name: '_animeCid', type: 'bytes32' },
      { name: '_encPhotoCid', type: 'bytes32' },
      { name: '_regionBucket', type: 'uint8' },
      { name: '_genderIdentity', type: 'uint8' },
      { name: '_bodyBucket', type: 'uint8' },
      { name: '_fitnessBucket', type: 'uint8' },
      { name: '_smoking', type: 'uint8' },
      { name: '_drinking', type: 'uint8' },
      { name: '_lookingFor', type: 'uint8' },
      { name: '_modelVersion', type: 'uint8' },
    ],
    name: 'registerOrUpdateProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Read functions
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getProfile',
    outputs: [
      {
        components: [
          { name: 'animeCid', type: 'bytes32' },
          { name: 'encPhotoCid', type: 'bytes32' },
          { name: 'ageBucket', type: 'uint8' },
          { name: 'verifiedLevel', type: 'uint8' },
          { name: 'regionBucket', type: 'uint8' },
          { name: 'genderIdentity', type: 'uint8' },
          { name: 'bodyBucket', type: 'uint8' },
          { name: 'fitnessBucket', type: 'uint8' },
          { name: 'smoking', type: 'uint8' },
          { name: 'drinking', type: 'uint8' },
          { name: 'lookingFor', type: 'uint8' },
          { name: 'updatedAt', type: 'uint32' },
          { name: 'modelVersion', type: 'uint8' },
          { name: 'exists', type: 'bool' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getProfileCount',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_index', type: 'uint256' }],
    name: 'getProfileAddress',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'isVerified',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint32' },
    ],
    name: 'ProfileUpdated',
    type: 'event',
  },
] as const

// Dating ABI (read functions + like)
export const datingAbi = [
  {
    inputs: [{ name: 'a', type: 'address' }, { name: 'b', type: 'address' }],
    name: 'areMatched',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }],
    name: 'hasUserLiked',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'profileInitialized',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'target', type: 'address' }],
    name: 'sendLike',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// Profile type from Directory contract
export interface DirectoryProfile {
  animeCid: `0x${string}`
  encPhotoCid: `0x${string}`
  ageBucket: number
  verifiedLevel: number
  regionBucket: number
  genderIdentity: number
  bodyBucket: number
  fitnessBucket: number
  smoking: number
  drinking: number
  lookingFor: number
  updatedAt: number
  modelVersion: number
  exists: boolean
}

// Human-readable mappings
export const AGE_BUCKETS: Record<number, string> = {
  0: 'Hidden',
  1: '18-24',
  2: '25-29',
  3: '30-34',
  4: '35-39',
  5: '40-49',
  6: '50+',
}

export const GENDER_LABELS: Record<number, string> = {
  0: 'Hidden',
  1: 'Man',
  2: 'Woman',
  3: 'Non-binary',
  4: 'Trans man',
  5: 'Trans woman',
}

export const REGION_LABELS: Record<number, string> = {
  0: 'Hidden',
  1: 'North America',
  2: 'Latin America & Caribbean',
  3: 'Europe',
  4: 'Middle East & North Africa',
  5: 'Sub-Saharan Africa',
  6: 'South Asia',
  7: 'East & Southeast Asia',
  8: 'Oceania',
  9: 'Prefer not to say',
}

export const LOOKING_FOR_LABELS: Record<number, string> = {
  0: 'Hidden',
  1: 'Low-commitment',
  2: 'Friends first',
  3: 'Relationship',
}

/**
 * Check if a user has initialized their Dating profile (required for likes)
 */
export async function isDatingInitialized(address: Address): Promise<boolean> {
  try {
    return await publicClient.readContract({
      address: CONTRACTS.dating,
      abi: datingAbi,
      functionName: 'profileInitialized',
      args: [address],
    })
  } catch (e) {
    console.error('Failed to check profileInitialized:', e)
    return false
  }
}

/**
 * Check if user A has liked user B
 */
export async function hasLiked(from: Address, to: Address): Promise<boolean> {
  try {
    return await publicClient.readContract({
      address: CONTRACTS.dating,
      abi: datingAbi,
      functionName: 'hasUserLiked',
      args: [from, to],
    })
  } catch (e) {
    console.error('Failed to check hasUserLiked:', e)
    return false
  }
}
