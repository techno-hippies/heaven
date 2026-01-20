mod auth;
mod config;
mod connection;
mod types;

pub use types::{SystemReadiness, VpnState, VpnStatus, WgKeypair};

use auth::{handle_vpn_auth_callback, VPN_AUTH_PAGE_URL};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use rand::rngs::OsRng;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{Manager, State};
use tokio::net::TcpListener;
use tokio::sync::RwLock;
use x25519_dalek::{PublicKey, StaticSecret};

/// Shared VPN state (integrate into main AppState)
pub type SharedVpnState = Arc<RwLock<VpnState>>;

// =============================================================================
// Tauri Commands
// =============================================================================

/// Generate WireGuard keypair using x25519-dalek
#[tauri::command]
pub async fn generate_wg_keypair() -> Result<WgKeypair, String> {
    let secret = StaticSecret::random_from_rng(OsRng);
    let public = PublicKey::from(&secret);

    Ok(WgKeypair {
        private_key: BASE64.encode(secret.as_bytes()),
        public_key: BASE64.encode(public.as_bytes()),
    })
}

/// Start VPN auth flow:
/// 1. Start local HTTP server for callback
/// 2. Open browser to auth page with pubkey and callback URL
#[tauri::command]
pub async fn start_vpn_auth(
    app: tauri::AppHandle,
    state: State<'_, SharedVpnState>,
    wg_pubkey: String,
) -> Result<(), String> {
    // Store the pubkey for later
    {
        let mut st = state.write().await;
        st.pending_pubkey = Some(wg_pubkey.clone());
    }

    // Start callback server
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| format!("Failed to bind: {}", e))?;

    let port = listener
        .local_addr()
        .map_err(|e| format!("Failed to get addr: {}", e))?
        .port();

    log::info!("VPN auth callback server on port {}", port);

    // Spawn listener task
    let app_handle = app.clone();
    tokio::spawn(async move {
        handle_vpn_auth_callback(listener, app_handle).await;
    });

    // Build auth URL
    let callback_url = format!("http://127.0.0.1:{}/callback", port);
    let auth_url = format!(
        "{}/#/vpn-auth?pubkey={}&callback={}",
        VPN_AUTH_PAGE_URL,
        urlencoding::encode(&wg_pubkey),
        urlencoding::encode(&callback_url)
    );

    log::info!("Opening browser to: {}", auth_url);

    // Open browser
    open::that(&auth_url).map_err(|e| format!("Failed to open browser: {}", e))?;

    Ok(())
}

/// Export WireGuard config to user-selected location
#[tauri::command]
pub async fn export_wg_config(config_content: String, filename: String) -> Result<(), String> {
    config::export_config(&config_content, &filename)
}

/// Save WireGuard config to app data directory
#[tauri::command]
pub async fn persist_vpn_config(
    app: tauri::AppHandle,
    state: State<'_, SharedVpnState>,
    config_content: String,
    wallet: String,
) -> Result<String, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Could not resolve app_data_dir: {}", e))?;

    let config_path = config::persist_config(&app_dir, &config_content, &wallet)?;

    // Update in-memory state
    {
        let mut st = state.write().await;
        st.config_path = Some(config_path.clone());
        st.wallet_address = Some(wallet);
    }

    Ok(config_path.to_string_lossy().to_string())
}

/// Activate VPN tunnel
#[tauri::command]
pub async fn vpn_up(state: State<'_, SharedVpnState>) -> Result<(), String> {
    let config_path = {
        let st = state.read().await;
        st.config_path
            .clone()
            .ok_or("No config saved. Run persist_vpn_config first.")?
    };

    connection::vpn_up(&config_path)
}

/// Deactivate VPN tunnel
#[tauri::command]
pub async fn vpn_down(state: State<'_, SharedVpnState>) -> Result<(), String> {
    let config_path = {
        let st = state.read().await;
        st.config_path.clone()
    };

    connection::vpn_down(&config_path)
}

/// Get VPN status
#[tauri::command]
pub async fn vpn_status(state: State<'_, SharedVpnState>) -> Result<VpnStatus, String> {
    let st = state.read().await;
    Ok(connection::get_status(&st.config_path, &st.wallet_address))
}

/// Check system readiness for VPN
#[tauri::command]
pub async fn check_vpn_system_ready() -> SystemReadiness {
    connection::check_system_ready()
}

/// Clear VPN config and logout
#[tauri::command]
pub async fn forget_vpn_device(
    app: tauri::AppHandle,
    state: State<'_, SharedVpnState>,
) -> Result<(), String> {
    // Clear in-memory state
    {
        let mut st = state.write().await;
        st.config_path = None;
        st.wallet_address = None;
        st.pending_pubkey = None;
    }

    // Delete files
    if let Ok(app_dir) = app.path().app_data_dir() {
        config::forget_device(&app_dir)?;
    }

    Ok(())
}

// =============================================================================
// Setup Helper
// =============================================================================

/// Load persisted VPN state on app startup
pub fn load_persisted_state(app_dir: &PathBuf) -> Option<VpnState> {
    let metadata = config::load_metadata(app_dir)?;

    let config_path = metadata.config_path.map(PathBuf::from);

    // Only restore if config file still exists
    if let Some(ref path) = config_path {
        if !path.exists() {
            log::warn!("VPN config file no longer exists: {:?}", path);
            return None;
        }
    }

    log::info!("Restored VPN state from disk");

    Some(VpnState {
        pending_pubkey: None,
        config_path,
        wallet_address: metadata.wallet_address,
    })
}
