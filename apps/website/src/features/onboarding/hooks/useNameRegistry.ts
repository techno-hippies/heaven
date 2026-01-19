/**
 * Hook for interacting with MultiTldSubnameRegistrarV3
 *
 * Provides:
 * - TLD configurations with dynamic pricing
 * - Availability checking
 * - Price calculation (with length-based multipliers)
 * - Registration
 */

import { createSignal, createResource, createMemo } from 'solid-js'
import {
  createPublicClient,
  http,
  formatEther,
  type Address,
  type Hex,
} from 'viem'
import { sepolia } from 'viem/chains'

// Contract addresses from env (with fallback for Storybook)
const REGISTRY_ADDRESS = (import.meta.env.VITE_NAME_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000') as Address

// TLD parent nodes (namehash of tld.hnsbridge.eth)
// Fallback values are zero hashes for Storybook/dev
export const TLD_NODES = {
  heaven: (import.meta.env.VITE_TLD_NODE_HEAVEN || '0x0000000000000000000000000000000000000000000000000000000000000000') as Hex,
  star: (import.meta.env.VITE_TLD_NODE_STAR || '0x0000000000000000000000000000000000000000000000000000000000000000') as Hex,
  spiral: (import.meta.env.VITE_TLD_NODE_SPIRAL || '0x0000000000000000000000000000000000000000000000000000000000000000') as Hex,
} as const

export type TldId = keyof typeof TLD_NODES

// TLD display info
export const TLD_INFO: Record<TldId, { label: string }> = {
  heaven: { label: '.heaven' },
  star: { label: '.⭐' },
  spiral: { label: '.🌀' },
}

// Registrar ABI (V3)
const registrarAbi = [
  // Views
  {
    inputs: [{ name: 'parentNode', type: 'bytes32' }],
    name: 'getTldConfig',
    outputs: [
      { name: 'parentName', type: 'string' },
      { name: 'pricePerYear', type: 'uint256' },
      { name: 'minLabelLength', type: 'uint8' },
      { name: 'maxDuration', type: 'uint256' },
      { name: 'registrationsOpen', type: 'bool' },
      { name: 'lengthPricingEnabled', type: 'bool' },
      { name: 'lengthMult1', type: 'uint16' },
      { name: 'lengthMult2', type: 'uint16' },
      { name: 'lengthMult3', type: 'uint16' },
      { name: 'lengthMult4', type: 'uint16' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'label', type: 'string' },
    ],
    name: 'available',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'label', type: 'string' },
      { name: 'duration', type: 'uint256' },
    ],
    name: 'price',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'label', type: 'string' },
    ],
    name: 'isReserved',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'parentNode', type: 'bytes32' },
      { name: 'label', type: 'string' },
      { name: 'duration', type: 'uint256' },
    ],
    name: 'register',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

// Public client for read operations
// Fallback to public Sepolia RPC for Storybook
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(import.meta.env.VITE_RPC_URL || 'https://rpc.sepolia.org'),
})

// Duration constants
const ONE_YEAR = BigInt(365 * 24 * 60 * 60) // 365 days in seconds

const OFFCHAIN_TLDS: TldId[] = ['heaven']

export interface TldConfig {
  parentName: string
  pricePerYear: bigint
  minLabelLength: number
  maxDuration: bigint
  registrationsOpen: boolean
  lengthPricingEnabled: boolean
  lengthMult1: number
  lengthMult2: number
  lengthMult3: number
  lengthMult4: number
}

// .heaven is off-chain: free for 5+ chars, premium pricing for 1-4 chars
// Price in wei (0.02 ETH base for short names)
const HEAVEN_SHORT_NAME_PRICE = BigInt('20000000000000000') // 0.02 ETH

const OFFCHAIN_TLD_CONFIGS: Partial<Record<TldId, TldConfig>> = {
  heaven: {
    parentName: 'heaven',
    pricePerYear: HEAVEN_SHORT_NAME_PRICE,
    minLabelLength: 4,
    maxDuration: ONE_YEAR,
    registrationsOpen: true,
    lengthPricingEnabled: true,
    lengthMult1: 10, // 1 char = 0.2 ETH
    lengthMult2: 5,  // 2 char = 0.1 ETH
    lengthMult3: 3,  // 3 char = 0.06 ETH
    lengthMult4: 2,  // 4 char = 0.04 ETH
    // 5+ chars = free (handled specially)
  },
}

// Mock configs for Storybook/dev when contract not connected
// .⭐ and .🌀 are on-chain, always paid
const MOCK_ONCHAIN_PRICE = BigInt('5000000000000000') // 0.005 ETH base

const STORYBOOK_TLD_CONFIGS: Partial<Record<TldId, TldConfig>> = {
  star: {
    parentName: '⭐',
    pricePerYear: MOCK_ONCHAIN_PRICE,
    minLabelLength: 4,
    maxDuration: ONE_YEAR * BigInt(5),
    registrationsOpen: true,
    lengthPricingEnabled: true,
    lengthMult1: 20, // 1 char = 0.1 ETH
    lengthMult2: 10, // 2 char = 0.05 ETH
    lengthMult3: 5,  // 3 char = 0.025 ETH
    lengthMult4: 2,  // 4 char = 0.01 ETH
    // 5+ chars = 0.005 ETH
  },
  spiral: {
    parentName: '🌀',
    pricePerYear: MOCK_ONCHAIN_PRICE,
    minLabelLength: 4,
    maxDuration: ONE_YEAR * BigInt(5),
    registrationsOpen: true,
    lengthPricingEnabled: true,
    lengthMult1: 20,
    lengthMult2: 10,
    lengthMult3: 5,
    lengthMult4: 2,
  },
}

const isOffchainTld = (tldId: TldId) => OFFCHAIN_TLDS.includes(tldId)

// Reserved names for off-chain TLDs (and Storybook demo)
const RESERVED_NAMES = new Set([
  'admin', 'root', 'system', 'heaven', 'support', 'help',
  'official', 'mod', 'moderator', 'staff', 'team',
])

/**
 * Fetch TLD configuration from contract
 */
export async function getTldConfig(tldId: TldId): Promise<TldConfig | undefined> {
  const offchainConfig = OFFCHAIN_TLD_CONFIGS[tldId]
  if (offchainConfig) return offchainConfig

  // Skip on-chain calls if registry not configured (Storybook/dev)
  if (REGISTRY_ADDRESS === '0x0000000000000000000000000000000000000000') {
    // Return mock config for Storybook
    return STORYBOOK_TLD_CONFIGS[tldId]
  }

  const parentNode = TLD_NODES[tldId]

  try {
    const result = await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: registrarAbi,
      functionName: 'getTldConfig',
      args: [parentNode],
    })

    return {
      parentName: result[0],
      pricePerYear: result[1],
      minLabelLength: result[2],
      maxDuration: result[3],
      registrationsOpen: result[4],
      lengthPricingEnabled: result[5],
      lengthMult1: result[6],
      lengthMult2: result[7],
      lengthMult3: result[8],
      lengthMult4: result[9],
    }
  } catch (e) {
    console.warn(`Failed to fetch config for ${tldId}:`, e)
    return undefined
  }
}

/**
 * Check if a label is available under a TLD
 */
export async function checkAvailability(
  tldId: TldId,
  label: string
): Promise<boolean> {
  if (!label || label.length < 1) return false
  if (isOffchainTld(tldId)) return true

  try {
    return await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: registrarAbi,
      functionName: 'available',
      args: [TLD_NODES[tldId], label],
    })
  } catch (e) {
    console.error('Error checking availability:', e)
    return false
  }
}

/**
 * Check if a label is reserved
 */
export async function checkReserved(
  tldId: TldId,
  label: string
): Promise<boolean> {
  if (!label) return false

  // Check local reserved list (applies to all TLDs)
  if (RESERVED_NAMES.has(label.toLowerCase())) return true

  // Off-chain TLDs only use local reserved list
  if (isOffchainTld(tldId)) return false

  // Storybook/dev mode - only use local list
  if (REGISTRY_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return false
  }

  try {
    return await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: registrarAbi,
      functionName: 'isReserved',
      args: [TLD_NODES[tldId], label],
    })
  } catch (e) {
    console.error('Error checking reserved:', e)
    return false
  }
}

/**
 * Get registration price from contract
 */
export async function getPrice(
  tldId: TldId,
  label: string,
  durationYears: number = 1
): Promise<bigint> {
  if (!label || label.length < 1) return BigInt(0)
  if (isOffchainTld(tldId)) return BigInt(0)

  const duration = ONE_YEAR * BigInt(durationYears)

  try {
    return await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: registrarAbi,
      functionName: 'price',
      args: [TLD_NODES[tldId], label, duration],
    })
  } catch (e) {
    console.error('Error getting price:', e)
    return BigInt(0)
  }
}

/**
 * Calculate price client-side (for immediate UI feedback)
 * Uses same logic as contract, with special handling for off-chain TLDs
 *
 * @param forDisplay - if true, calculates price based on length even if below minLabelLength (for UI)
 */
export function calculatePriceLocal(
  config: TldConfig,
  label: string,
  durationYears: number = 1,
  tldId?: TldId,
  forDisplay: boolean = false
): bigint {
  if (!label) return BigInt(0)

  // For actual price calculation, require minLabelLength
  // For display purposes, show what it would cost
  if (!forDisplay && label.length < config.minLabelLength) return BigInt(0)

  const len = label.length

  // .heaven special case: 5+ chars are free
  if (tldId && isOffchainTld(tldId) && len >= 5) {
    return BigInt(0)
  }

  let mult = 1

  if (config.lengthPricingEnabled) {
    if (len === 1) mult = config.lengthMult1
    else if (len === 2) mult = config.lengthMult2
    else if (len === 3) mult = config.lengthMult3
    else if (len === 4) mult = config.lengthMult4
  }

  const duration = ONE_YEAR * BigInt(durationYears)
  return (config.pricePerYear * BigInt(mult) * duration) / ONE_YEAR
}

/**
 * Format price for display
 */
export function formatPrice(weiAmount: bigint): string {
  if (weiAmount === BigInt(0)) return 'Free'

  const eth = formatEther(weiAmount)
  const display = eth.includes('.')
    ? eth.replace(/0+$/, '').replace(/\.$/, '')
    : eth

  return `${display} ETH`
}

/**
 * Validate label characters (same rules as contract)
 */
export function isValidLabel(label: string): boolean {
  if (!label || label.length === 0 || label.length > 63) return false

  for (let i = 0; i < label.length; i++) {
    const c = label.charCodeAt(i)
    const isLower = c >= 0x61 && c <= 0x7a // a-z
    const isDigit = c >= 0x30 && c <= 0x39 // 0-9
    const isHyphen = c === 0x2d // -

    if (!isLower && !isDigit && !isHyphen) return false
    if (isHyphen && (i === 0 || i === label.length - 1)) return false
  }

  return true
}

/**
 * Sanitize input to valid label characters
 */
export function sanitizeLabel(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

// ============================================================
// Solid.js Hook
// ============================================================

export interface UseNameRegistryOptions {
  /** Initial TLD to select */
  initialTld?: TldId
  /** Debounce delay for availability checks (ms) */
  debounceMs?: number
}

export interface UseNameRegistryReturn {
  // State
  name: () => string
  setName: (name: string) => void
  selectedTld: () => TldId
  setSelectedTld: (tld: TldId) => void

  // Derived
  isValidName: () => boolean
  tldConfig: () => TldConfig | undefined
  price: () => bigint
  priceFormatted: () => string
  isAvailable: () => boolean | undefined
  isReserved: () => boolean | undefined
  isChecking: () => boolean

  // Pricing context
  isPremiumLength: () => boolean  // 1-4 chars (premium pricing)
  isFreeEligible: () => boolean   // 5+ chars on off-chain TLD
  isOffchainTld: () => boolean    // .heaven

  // Status helpers
  status: () => 'idle' | 'checking' | 'valid' | 'invalid' | 'reserved' | 'too-short'

  // All TLDs with current pricing
  tldOptions: () => Array<{
    id: TldId
    label: string
    price: string
    priceWei: bigint
    config: TldConfig | undefined
    isFree: boolean
  }>
}

/**
 * Main hook for name registry interactions
 */
export function useNameRegistry(
  options: UseNameRegistryOptions = {}
): UseNameRegistryReturn {
  const { initialTld = 'heaven', debounceMs = 300 } = options

  // Core state
  const [name, setNameRaw] = createSignal('')
  const [selectedTld, setSelectedTld] = createSignal<TldId>(initialTld)
  const [debouncedName, setDebouncedName] = createSignal('')

  // Debounce name changes
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  const setName = (newName: string) => {
    const sanitized = sanitizeLabel(newName)
    setNameRaw(sanitized)

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      setDebouncedName(sanitized)
    }, debounceMs)
  }

  // Fetch TLD configs
  const [heavenConfig] = createResource(() => getTldConfig('heaven'))
  const [starConfig] = createResource(() => getTldConfig('star'))
  const [spiralConfig] = createResource(() => getTldConfig('spiral'))

  const tldConfigs = createMemo(() => ({
    heaven: heavenConfig(),
    star: starConfig(),
    spiral: spiralConfig(),
  }))

  const tldConfig = createMemo(() => tldConfigs()[selectedTld()])

  // Validate name
  const isValidName = createMemo(() => {
    const n = name()
    const config = tldConfig()
    if (!config) return false
    return isValidLabel(n) && n.length >= config.minLabelLength
  })

  // Calculate price locally (instant feedback)
  const price = createMemo(() => {
    const config = tldConfig()
    if (!config) return BigInt(0)
    return calculatePriceLocal(config, name(), 1, selectedTld())
  })

  const priceFormatted = createMemo(() => formatPrice(price()))

  // Check availability (debounced, async)
  const [availabilityResult] = createResource(
    () => {
      const n = debouncedName()
      const tld = selectedTld()
      const config = tldConfig()
      if (!n || !config || n.length < config.minLabelLength) return null
      return { tld, name: n }
    },
    async (params) => {
      if (!params) return undefined
      const [avail, reserved] = await Promise.all([
        checkAvailability(params.tld, params.name),
        checkReserved(params.tld, params.name),
      ])
      return { available: avail, reserved }
    }
  )

  const isAvailable = createMemo(() => availabilityResult()?.available)
  const isReserved = createMemo(() => availabilityResult()?.reserved)
  const isChecking = createMemo(() => availabilityResult.loading)

  // Overall status
  const status = createMemo(() => {
    const n = name()
    const config = tldConfig()

    if (!n || n.length === 0) return 'idle' as const

    if (!isValidLabel(n)) return 'invalid' as const

    if (config && n.length < config.minLabelLength) return 'too-short' as const

    if (isChecking()) return 'checking' as const

    if (isReserved()) return 'reserved' as const

    if (isAvailable() === false) return 'invalid' as const

    if (isAvailable() === true) return 'valid' as const

    return 'idle' as const
  })

  // Pricing context helpers
  const isPremiumLength = createMemo(() => {
    const len = name().length
    return len >= 1 && len <= 4
  })

  const isFreeEligible = createMemo(() => {
    const len = name().length
    return isOffchainTld(selectedTld()) && len >= 5
  })

  const isOffchain = createMemo(() => isOffchainTld(selectedTld()))

  // TLD options with pricing
  const tldOptions = createMemo(() => {
    const configs = tldConfigs()
    const currentName = name()
    return (['heaven', 'star', 'spiral'] as TldId[]).map((id) => {
      const config = configs[id]
      // Use forDisplay=true to show prices even for short names
      const priceWei = config
        ? calculatePriceLocal(config, currentName || 'xxxxx', 1, id, true)
        : BigInt(0)

      // For display, treat zero-price as free to avoid "Free/year"
      const isFree = priceWei === BigInt(0)

      return {
        id,
        label: TLD_INFO[id].label,
        price: formatPrice(priceWei),
        priceWei,
        config,
        isFree,
      }
    })
  })

  return {
    name,
    setName,
    selectedTld,
    setSelectedTld,
    isValidName,
    tldConfig,
    price,
    priceFormatted,
    isAvailable,
    isReserved,
    isChecking,
    isPremiumLength,
    isFreeEligible,
    isOffchainTld: isOffchain,
    status,
    tldOptions,
  }
}

export default useNameRegistry
