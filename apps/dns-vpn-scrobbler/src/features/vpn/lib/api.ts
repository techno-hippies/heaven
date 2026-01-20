/**
 * VPN Server API Client
 * Handles SIWE auth and device provisioning
 */

const API_BASE = import.meta.env.VITE_VPN_API_URL || 'http://144.126.205.242:8080'

export interface ChallengeResponse {
  nonce: string
  message: string
}

export interface VerifyResponse {
  user_id: string
  token: string
  wallet_address: string
}

export interface CreateDeviceResponse {
  device_id: string
  vpn_ip: string
  wg_provisioned: boolean
}

export interface WgConfigResponse {
  config: string
}

/**
 * Request a SIWE challenge message
 */
export async function getChallenge(address: string): Promise<ChallengeResponse> {
  const res = await fetch(`${API_BASE}/auth/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  })

  if (!res.ok) {
    throw new Error(`Challenge failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

/**
 * Verify SIWE signature and get JWT
 */
export async function verifySignature(
  message: string,
  signature: string
): Promise<VerifyResponse> {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, signature }),
  })

  if (!res.ok) {
    throw new Error(`Verify failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

/**
 * Create a new device (register WireGuard peer)
 */
export async function createDevice(
  token: string,
  deviceName: string,
  wgPubkey: string
): Promise<CreateDeviceResponse> {
  const res = await fetch(`${API_BASE}/devices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      device_name: deviceName,
      wg_pubkey: wgPubkey,
    }),
  })

  if (!res.ok) {
    throw new Error(`Create device failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

/**
 * Get WireGuard config for a device
 */
export async function getWgConfig(
  token: string,
  deviceId: string
): Promise<WgConfigResponse> {
  const res = await fetch(`${API_BASE}/devices/${deviceId}/wg-config`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error(`Get config failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}
