/**
 * XMTP Module
 * End-to-end encrypted messaging via XMTP protocol
 */

export {
  initXMTPClient,
  getClient,
  getOrCreateDM,
  listDMs,
  sendMessage,
  loadMessages,
  streamMessages,
  disconnect,
  isConnected,
  type Dm,
  type DecodedMessage,
} from './client'
