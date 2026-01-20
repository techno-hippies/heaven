/**
 * XMTP Browser Client
 *
 * Wraps @xmtp/browser-sdk with Lit Protocol PKP signer integration.
 */

import {
  Client,
  IdentifierKind,
  ConsentState,
  type ListMessagesOptions,
  type Signer,
  type Dm,
  type DecodedMessage,
} from '@xmtp/browser-sdk'
import type { PKPInfo } from '@/lib/lit'

const IS_DEV = import.meta.env.DEV
const XMTP_ENV = (import.meta.env.VITE_XMTP_ENV || (IS_DEV ? 'dev' : 'production')) as
  | 'dev'
  | 'production'

// Singleton client instance
let xmtpClient: Client | null = null
let xmtpClientPromise: Promise<Client> | null = null

/**
 * Convert hex string signature to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/**
 * Create an XMTP-compatible signer from Lit Protocol PKP
 */
export function createPKPSigner(
  pkpInfo: PKPInfo,
  signMessage: (message: string) => Promise<string>
): Signer {
  return {
    type: 'EOA',
    getIdentifier: () => ({
      identifier: pkpInfo.ethAddress,
      identifierKind: IdentifierKind.Ethereum,
    }),
    signMessage: async (message: string) => {
      const signature = await signMessage(message)
      return hexToBytes(signature)
    },
  }
}

/**
 * Initialize XMTP client with PKP signer
 */
export async function initXMTPClient(
  pkpInfo: PKPInfo,
  signMessage: (message: string) => Promise<string>
): Promise<Client> {
  // Return existing if same identity
  if (xmtpClient) {
    return xmtpClient
  }
  if (xmtpClientPromise) {
    return xmtpClientPromise
  }

  if (IS_DEV) console.log('[XMTP] Initializing client for:', pkpInfo.ethAddress)

  xmtpClientPromise = (async () => {
    const signer = createPKPSigner(pkpInfo, signMessage)

    xmtpClient = await Client.create(signer, {
      env: XMTP_ENV,
    })

    if (IS_DEV) console.log('[XMTP] Client initialized:', xmtpClient.inboxId)

    return xmtpClient
  })()

  try {
    return await xmtpClientPromise
  } catch (error) {
    xmtpClientPromise = null
    console.error('[XMTP] Failed to initialize client:', error)
    throw error
  } finally {
    xmtpClientPromise = null
  }
}

/**
 * Get the current client (must be initialized first)
 */
export function getClient(): Client | null {
  return xmtpClient
}

/**
 * Get or create a DM conversation with an address
 */
export async function getOrCreateDM(address: string): Promise<Dm> {
  if (!xmtpClient) {
    throw new Error('XMTP client not initialized')
  }

  const conversation = await xmtpClient.conversations.createDmWithIdentifier({
    identifier: address,
    identifierKind: IdentifierKind.Ethereum,
  })

  if (IS_DEV) console.log('[XMTP] DM created:', conversation.id)

  return conversation
}

/**
 * List all DM conversations
 */
export async function listDMs(): Promise<Dm[]> {
  if (!xmtpClient) {
    throw new Error('XMTP client not initialized')
  }

  const consentStates = [ConsentState.Allowed, ConsentState.Unknown]
  await xmtpClient.conversations.syncAll(consentStates)
  return xmtpClient.conversations.listDms({ consentStates })
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(conversation: Dm, content: string): Promise<void> {
  await conversation.sendText(content)
  if (IS_DEV) console.log('[XMTP] Message sent')
}

/**
 * Load messages from a conversation
 */
export async function loadMessages(
  conversation: Dm,
  options?: ListMessagesOptions
): Promise<DecodedMessage[]> {
  await conversation.sync()
  return conversation.messages(options)
}

/**
 * Stream messages from a conversation
 */
export async function streamMessages(
  conversation: Dm,
  onMessage: (message: DecodedMessage) => void,
  onError?: (error: Error) => void
): Promise<() => void> {
  const stream = await conversation.stream()

  let isActive = true

  ;(async () => {
    try {
      for await (const msg of stream) {
        if (!isActive || msg === undefined) break
        onMessage(msg)
      }
    } catch (error) {
      if (isActive && error instanceof Error) {
        console.error('[XMTP] Stream error:', error)
        onError?.(error)
      }
    }
  })()

  return () => {
    isActive = false
  }
}

/**
 * Disconnect and cleanup
 */
export function disconnect(): void {
  xmtpClient = null
  xmtpClientPromise = null
  if (IS_DEV) console.log('[XMTP] Disconnected')
}

/**
 * Check if client is connected
 */
export function isConnected(): boolean {
  return xmtpClient !== null
}

// Re-export types
export type { Dm, DecodedMessage }
