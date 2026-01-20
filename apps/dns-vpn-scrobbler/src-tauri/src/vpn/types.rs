use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// WireGuard interface name
pub const WG_INTERFACE: &str = "heaven-vpn";

/// VPN metadata file name
pub const VPN_METADATA_FILE: &str = "heaven-vpn-metadata.json";

/// WireGuard keypair (base64 encoded)
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WgKeypair {
    pub private_key: String,
    pub public_key: String,
}

/// VPN connection status
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VpnStatus {
    pub connected: bool,
    pub interface_exists: bool,
    pub config_saved: bool,
    pub wallet: Option<String>,
}

/// System readiness check result
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SystemReadiness {
    pub ready: bool,
    pub error: Option<String>,
}

/// Auth result from VPN browser callback
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VpnAuthResult {
    pub config: Option<String>,
    pub wallet: Option<String>,
    pub error: Option<String>,
}

/// Persisted VPN metadata (survives app restarts)
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct VpnPersistedMetadata {
    pub config_path: Option<String>,
    pub wallet_address: Option<String>,
}

/// VPN-specific state (integrated into main AppState)
#[derive(Debug, Default)]
pub struct VpnState {
    /// Pending WireGuard public key during auth flow
    pub pending_pubkey: Option<String>,
    /// Path to saved WireGuard config
    pub config_path: Option<PathBuf>,
    /// Wallet address from auth
    pub wallet_address: Option<String>,
}
