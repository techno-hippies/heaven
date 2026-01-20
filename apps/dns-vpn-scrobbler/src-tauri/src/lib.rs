mod scrobble;
mod vpn;

use base64::Engine as _;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{Emitter, Manager, State};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::sync::{mpsc, RwLock};

use scrobble::{
    MprisListener, NowPlaying, PendingScrobble, Scrobble, ScrobbleEvent, ScrobbleQueue, SyncStatus,
};
use vpn::VpnState;

// Auth page URL - for dev, use local website; for prod, use hosted page
#[cfg(debug_assertions)]
const AUTH_PAGE_URL: &str = "http://localhost:3000/auth";
#[cfg(not(debug_assertions))]
const AUTH_PAGE_URL: &str = "https://heaven.computer/auth";

// =============================================================================
// Types
// =============================================================================

/// Auth result from browser callback
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AuthResult {
    pub pkp_public_key: Option<String>,
    pub pkp_address: Option<String>,
    pub pkp_token_id: Option<String>,
    pub auth_method_type: Option<u32>,
    pub auth_method_id: Option<String>,
    pub access_token: Option<String>,
    pub is_new_user: Option<bool>,
    pub error: Option<String>,
}

/// App configuration
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct AppConfig {
    pub pkp_address: Option<String>,
    pub pkp_public_key: Option<String>,
    pub auth_method_type: Option<u32>,
    pub auth_method_id: Option<String>,
    pub access_token: Option<String>,
    pub relay_url: String,
    pub sync_interval_hours: u32,
    pub batch_size: u32,
}

// Metadata file name
const METADATA_FILE: &str = "scrobbler-metadata.json";

/// Persisted metadata
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
struct PersistedMetadata {
    pub pkp_address: Option<String>,
    pub pkp_public_key: Option<String>,
    pub auth_method_type: Option<u32>,
    pub auth_method_id: Option<String>,
    pub access_token: Option<String>,
}

// =============================================================================
// State
// =============================================================================

struct AppState {
    config: AppConfig,
    queue: Option<Arc<ScrobbleQueue>>,
    mpris: Option<Arc<MprisListener>>,
    app_dir: Option<PathBuf>,
    is_syncing: bool,
    #[allow(dead_code)] // VPN feature not yet implemented
    vpn: VpnState,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            config: AppConfig::default(),
            queue: None,
            mpris: None,
            app_dir: None,
            is_syncing: false,
            vpn: VpnState::default(),
        }
    }
}

type SharedState = Arc<RwLock<AppState>>;

// =============================================================================
// Commands - Scrobble Queue
// =============================================================================

#[tauri::command]
async fn get_pending_count(state: State<'_, SharedState>) -> Result<u32, String> {
    let st = state.read().await;
    match &st.queue {
        Some(queue) => queue.get_pending_count(),
        None => Ok(0),
    }
}

#[tauri::command]
async fn get_today_count(state: State<'_, SharedState>) -> Result<u32, String> {
    let st = state.read().await;
    match &st.queue {
        Some(queue) => queue.get_today_count(),
        None => Ok(0),
    }
}

#[tauri::command]
async fn get_recent_scrobbles(
    state: State<'_, SharedState>,
    limit: Option<u32>,
) -> Result<Vec<Scrobble>, String> {
    let st = state.read().await;
    match &st.queue {
        Some(queue) => queue.get_recent(limit.unwrap_or(20)),
        None => Ok(vec![]),
    }
}

/// Get pending scrobbles for batch submission to Lit Action
#[tauri::command]
async fn get_pending_batch(
    state: State<'_, SharedState>,
    limit: Option<u32>,
) -> Result<Vec<PendingScrobble>, String> {
    let st = state.read().await;
    match &st.queue {
        Some(queue) => queue.get_pending_batch(limit.unwrap_or(500)),
        None => Ok(vec![]),
    }
}

/// Mark scrobbles as synced after successful Lit Action call
#[tauri::command]
async fn mark_batch_synced(
    state: State<'_, SharedState>,
    ids: Vec<i64>,
    cid: String,
    tx_hash: String,
) -> Result<(), String> {
    let st = state.read().await;
    match &st.queue {
        Some(queue) => queue.mark_batch_synced(&ids, &cid, &tx_hash),
        None => Err("Queue not initialized".into()),
    }
}

// =============================================================================
// Commands - Sync
// =============================================================================

#[tauri::command]
async fn get_sync_status(state: State<'_, SharedState>) -> Result<SyncStatus, String> {
    let st = state.read().await;
    match &st.queue {
        Some(queue) => {
            let mut status = queue.get_sync_status()?;
            status.is_syncing = st.is_syncing;
            Ok(status)
        }
        None => Ok(SyncStatus {
            today_count: 0,
            pending_count: 0,
            last_sync: None,
            is_syncing: false,
        }),
    }
}

#[tauri::command]
async fn set_syncing(state: State<'_, SharedState>, syncing: bool) -> Result<(), String> {
    let mut st = state.write().await;
    st.is_syncing = syncing;
    Ok(())
}

/// Get the next nonce for batch signing (for Lit Action)
#[tauri::command]
async fn get_next_nonce(state: State<'_, SharedState>) -> Result<u64, String> {
    let st = state.read().await;
    match &st.queue {
        Some(queue) => queue.get_next_nonce(),
        None => Err("Queue not initialized".into()),
    }
}

/// Record a nonce after successful batch submission
#[tauri::command]
async fn record_nonce(
    state: State<'_, SharedState>,
    nonce: u64,
    tx_hash: String,
    cid: String,
) -> Result<(), String> {
    let st = state.read().await;
    match &st.queue {
        Some(queue) => queue.record_nonce(nonce, &tx_hash, &cid),
        None => Err("Queue not initialized".into()),
    }
}

/// Get the PKP public key for signing
#[tauri::command]
async fn get_pkp_public_key(state: State<'_, SharedState>) -> Result<Option<String>, String> {
    let st = state.read().await;
    Ok(st.config.pkp_public_key.clone())
}

/// Get full auth data for Lit Protocol
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthDataResponse {
    pub auth_method_type: Option<u32>,
    pub auth_method_id: Option<String>,
    pub access_token: Option<String>,
}

#[tauri::command]
async fn get_auth_data(state: State<'_, SharedState>) -> Result<Option<AuthDataResponse>, String> {
    let st = state.read().await;
    if st.config.auth_method_type.is_none() {
        return Ok(None);
    }
    Ok(Some(AuthDataResponse {
        auth_method_type: st.config.auth_method_type,
        auth_method_id: st.config.auth_method_id.clone(),
        access_token: st.config.access_token.clone(),
    }))
}

// =============================================================================
// Commands - Now Playing
// =============================================================================

#[tauri::command]
async fn get_now_playing(state: State<'_, SharedState>) -> Result<Option<NowPlaying>, String> {
    let st = state.read().await;
    match &st.mpris {
        Some(mpris) => Ok(mpris.get_now_playing().await),
        None => Ok(None),
    }
}

/// Resolve local album art URLs to data URLs for the webview
#[tauri::command]
async fn get_album_art(art_url: String) -> Result<Option<String>, String> {
    if art_url.is_empty() {
        return Ok(None);
    }

    if art_url.starts_with("http://")
        || art_url.starts_with("https://")
        || art_url.starts_with("data:")
    {
        return Ok(Some(art_url));
    }

    let Some(path) = parse_local_art_path(&art_url) else {
        return Ok(None);
    };

    if !path.exists() {
        return Ok(None);
    }

    let bytes = std::fs::read(&path).map_err(|e| format!("Failed to read art: {}", e))?;
    let mime = guess_mime_type(&path, &bytes);
    let encoded = base64::engine::general_purpose::STANDARD.encode(bytes);
    Ok(Some(format!("data:{};base64,{}", mime, encoded)))
}

fn parse_local_art_path(art_url: &str) -> Option<PathBuf> {
    if art_url.starts_with("file://") {
        let mut path = &art_url["file://".len()..];
        if let Some(stripped) = path.strip_prefix("localhost/") {
            path = stripped;
        }
        let decoded = urlencoding::decode(path).ok()?;
        let mut path_str = decoded.to_string();
        if !path_str.starts_with('/') {
            path_str = format!("/{}", path_str);
        }
        return Some(PathBuf::from(path_str));
    }

    if art_url.starts_with('/') {
        return Some(PathBuf::from(art_url));
    }

    None
}

fn guess_mime_type(path: &Path, bytes: &[u8]) -> &'static str {
    let ext = path
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();

    match ext.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        _ => sniff_mime_type(bytes).unwrap_or("application/octet-stream"),
    }
}

fn sniff_mime_type(bytes: &[u8]) -> Option<&'static str> {
    if bytes.len() >= 8 && bytes.starts_with(&[0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A])
    {
        return Some("image/png");
    }
    if bytes.len() >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 {
        return Some("image/jpeg");
    }
    if bytes.len() >= 6 && (bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a")) {
        return Some("image/gif");
    }
    if bytes.len() >= 12 && bytes.starts_with(b"RIFF") && &bytes[8..12] == b"WEBP" {
        return Some("image/webp");
    }
    if bytes.len() >= 2 && bytes.starts_with(b"BM") {
        return Some("image/bmp");
    }
    None
}

// =============================================================================
// Commands - Auth (Browser-based WebAuthn)
// =============================================================================

#[tauri::command]
async fn is_authenticated(state: State<'_, SharedState>) -> Result<bool, String> {
    let st = state.read().await;
    Ok(st.config.pkp_address.is_some())
}

#[tauri::command]
async fn get_pkp_address(state: State<'_, SharedState>) -> Result<Option<String>, String> {
    let st = state.read().await;
    Ok(st.config.pkp_address.clone())
}

/// Start browser-based auth flow
/// 1. Start local HTTP server for callback
/// 2. Open browser to auth page with callback URL
#[tauri::command]
async fn start_passkey_auth(app: tauri::AppHandle) -> Result<(), String> {
    // Start callback server on random port
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| format!("Failed to bind: {}", e))?;

    let port = listener
        .local_addr()
        .map_err(|e| format!("Failed to get addr: {}", e))?
        .port();

    log::info!("Auth callback server on port {}", port);

    // Spawn listener task
    let app_handle = app.clone();
    tokio::spawn(async move {
        handle_auth_callback(listener, app_handle).await;
    });

    // Build auth URL (website uses HashRouter so format is /#/auth?callback=...)
    let callback_url = format!("http://127.0.0.1:{}/callback", port);
    let auth_url = format!(
        "{}#/auth?callback={}",
        AUTH_PAGE_URL.trim_end_matches("/auth"),
        urlencoding::encode(&callback_url)
    );

    log::info!("Opening browser to: {}", auth_url);

    // Open browser
    open::that(&auth_url).map_err(|e| format!("Failed to open browser: {}", e))?;

    Ok(())
}

async fn handle_auth_callback(listener: TcpListener, app: tauri::AppHandle) {
    loop {
        if let Ok((mut socket, _)) = listener.accept().await {
            let mut buffer = vec![0u8; 16384];

            if let Ok(n) = socket.read(&mut buffer).await {
                let request = String::from_utf8_lossy(&buffer[..n]);
                log::info!(
                    "Received callback: {}",
                    request.lines().next().unwrap_or("")
                );

                // Handle CORS preflight
                if request.starts_with("OPTIONS") {
                    let response = build_cors_preflight();
                    let _ = socket.write_all(response.as_bytes()).await;
                    continue;
                }

                if let Some(result) = parse_callback(&request) {
                    log::info!(
                        "Parsed callback successfully: pkp_address={:?}",
                        result.pkp_address
                    );
                    let response = build_json_response(true);
                    let _ = socket.write_all(response.as_bytes()).await;

                    if result.error.is_some() {
                        log::info!("Emitting auth-error");
                        let _ = app.emit("auth-error", result);
                    } else {
                        log::info!("Emitting auth-complete");
                        let _ = app.emit("auth-complete", result);
                    }
                    break;
                } else {
                    log::error!("Failed to parse callback body");
                    let response = build_json_response(false);
                    let _ = socket.write_all(response.as_bytes()).await;

                    let _ = app.emit(
                        "auth-error",
                        AuthResult {
                            pkp_public_key: None,
                            pkp_address: None,
                            pkp_token_id: None,
                            auth_method_type: None,
                            auth_method_id: None,
                            access_token: None,
                            is_new_user: None,
                            error: Some("Invalid callback".into()),
                        },
                    );
                    break;
                }
            }
        }
    }
}

fn parse_callback(request: &str) -> Option<AuthResult> {
    let first_line = request.lines().next()?;

    // Handle POST requests with JSON body
    if first_line.starts_with("POST /callback") {
        // Find the body (after empty line)
        let body_start = request.find("\r\n\r\n").or_else(|| request.find("\n\n"))?;
        let body = &request[body_start..].trim();
        log::info!("Callback body: {}", body);

        #[derive(serde::Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct CallbackBody {
            pkp_public_key: Option<String>,
            pkp_address: Option<String>,
            pkp_token_id: Option<String>,
            auth_method_type: Option<u32>,
            auth_method_id: Option<String>,
            access_token: Option<String>,
            is_new_user: Option<bool>,
            error: Option<String>,
        }

        // Parse JSON
        let parsed: CallbackBody = serde_json::from_str(body).ok()?;
        return Some(AuthResult {
            pkp_public_key: parsed.pkp_public_key,
            pkp_address: parsed.pkp_address,
            pkp_token_id: parsed.pkp_token_id,
            auth_method_type: parsed.auth_method_type,
            auth_method_id: parsed.auth_method_id,
            access_token: parsed.access_token,
            is_new_user: parsed.is_new_user,
            error: parsed.error,
        });
    }

    None
}

fn build_cors_preflight() -> String {
    "HTTP/1.1 204 No Content\r\n\
     Access-Control-Allow-Origin: *\r\n\
     Access-Control-Allow-Methods: POST, OPTIONS\r\n\
     Access-Control-Allow-Headers: Content-Type\r\n\
     Access-Control-Max-Age: 86400\r\n\
     Connection: close\r\n\r\n"
        .to_string()
}

fn build_json_response(success: bool) -> String {
    let body = if success {
        r#"{"ok":true}"#
    } else {
        r#"{"ok":false}"#
    };
    format!(
        "HTTP/1.1 200 OK\r\n\
         Content-Type: application/json\r\n\
         Access-Control-Allow-Origin: *\r\n\
         Connection: close\r\n\
         Content-Length: {}\r\n\r\n{}",
        body.len(),
        body
    )
}

/// Save auth result to state and persist
#[tauri::command]
async fn save_auth(
    app: tauri::AppHandle,
    state: State<'_, SharedState>,
    pkp_address: String,
    pkp_public_key: String,
    auth_method_type: Option<u32>,
    auth_method_id: Option<String>,
    access_token: Option<String>,
) -> Result<(), String> {
    // Update in-memory state
    {
        let mut st = state.write().await;
        st.config.pkp_address = Some(pkp_address.clone());
        st.config.pkp_public_key = Some(pkp_public_key.clone());
        st.config.auth_method_type = auth_method_type;
        st.config.auth_method_id = auth_method_id.clone();
        st.config.access_token = access_token.clone();
    }

    // Persist to disk
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Could not resolve app_data_dir: {}", e))?;

    std::fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create dir: {}", e))?;

    let metadata = PersistedMetadata {
        pkp_address: Some(pkp_address),
        pkp_public_key: Some(pkp_public_key),
        auth_method_type,
        auth_method_id,
        access_token,
    };

    save_metadata(&app_dir, &metadata)?;

    log::info!("Auth saved to disk");
    Ok(())
}

fn save_metadata(app_dir: &PathBuf, metadata: &PersistedMetadata) -> Result<(), String> {
    let metadata_path = app_dir.join(METADATA_FILE);
    let json = serde_json::to_string_pretty(metadata)
        .map_err(|e| format!("Failed to serialize metadata: {}", e))?;

    std::fs::write(&metadata_path, json).map_err(|e| format!("Failed to write metadata: {}", e))?;

    log::info!("Saved metadata to {:?}", metadata_path);
    Ok(())
}

fn load_metadata(app_dir: &PathBuf) -> Option<PersistedMetadata> {
    let metadata_path = app_dir.join(METADATA_FILE);

    if !metadata_path.exists() {
        return None;
    }

    let contents = std::fs::read_to_string(&metadata_path).ok()?;
    serde_json::from_str(&contents).ok()
}

#[tauri::command]
async fn sign_out(app: tauri::AppHandle, state: State<'_, SharedState>) -> Result<(), String> {
    // Clear in-memory state
    {
        let mut st = state.write().await;
        st.config.pkp_address = None;
        st.config.pkp_public_key = None;
    }

    // Delete metadata file
    if let Ok(app_dir) = app.path().app_data_dir() {
        let metadata_path = app_dir.join(METADATA_FILE);
        let _ = std::fs::remove_file(&metadata_path);
    }

    log::info!("Signed out");
    Ok(())
}

// =============================================================================
// App Entry Point
// =============================================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let state: SharedState = Arc::new(RwLock::new(AppState {
        config: AppConfig {
            pkp_address: None,
            pkp_public_key: None,
            auth_method_type: None,
            auth_method_id: None,
            access_token: None,
            relay_url: "https://scrobble-relay.workers.dev".into(),
            sync_interval_hours: 24,
            batch_size: 500,
        },
        queue: None,
        mpris: None,
        app_dir: None,
        is_syncing: false,
        vpn: VpnState::default(),
    }));

    // Separate VPN state for vpn module commands
    let vpn_state: vpn::SharedVpnState = Arc::new(RwLock::new(VpnState::default()));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(state.clone())
        .manage(vpn_state.clone())
        .setup(move |app| {
            let app_handle = app.handle().clone();
            let app_dir = app.path().app_data_dir().ok();

            if let Some(ref dir) = app_dir {
                std::fs::create_dir_all(dir).ok();

                // Load persisted auth (scrobbler)
                if let Some(metadata) = load_metadata(dir) {
                    log::info!("Loaded persisted auth: {:?}", metadata.pkp_address);
                    let mut st = state.blocking_write();
                    st.config.pkp_address = metadata.pkp_address;
                    st.config.pkp_public_key = metadata.pkp_public_key;
                    st.config.auth_method_type = metadata.auth_method_type;
                    st.config.auth_method_id = metadata.auth_method_id;
                    st.config.access_token = metadata.access_token;
                    st.app_dir = Some(dir.clone());
                }

                // Load persisted VPN state
                if let Some(vpn_persisted) = vpn::load_persisted_state(dir) {
                    log::info!("Loaded persisted VPN state");
                    let mut vpn_st = vpn_state.blocking_write();
                    *vpn_st = vpn_persisted;
                }

                // Initialize SQLite queue
                let db_path = dir.join("scrobbles.db");
                match ScrobbleQueue::open(&db_path) {
                    Ok(queue) => {
                        log::info!("Opened scrobble queue at {:?}", db_path);
                        let queue = Arc::new(queue);

                        // Create event channel for MPRIS -> frontend
                        let (event_tx, mut event_rx) = mpsc::unbounded_channel::<ScrobbleEvent>();

                        // Create MPRIS listener
                        let mpris = Arc::new(MprisListener::new(Arc::clone(&queue), event_tx));

                        // Store in state
                        {
                            let mut st = state.blocking_write();
                            st.queue = Some(queue);
                            st.mpris = Some(Arc::clone(&mpris));
                            if st.app_dir.is_none() {
                                st.app_dir = Some(dir.clone());
                            }
                        }

                        // Spawn event forwarder (MPRIS events -> Tauri events)
                        // Emit minimal payloads (just the data, no type tag)
                        let app_for_events = app_handle.clone();
                        tauri::async_runtime::spawn(async move {
                            while let Some(event) = event_rx.recv().await {
                                match event {
                                    ScrobbleEvent::NowPlayingChanged { now_playing } => {
                                        log::debug!("Now playing: {:?}", now_playing);
                                        let _ = app_for_events.emit("now-playing-changed", &now_playing);
                                    }
                                    ScrobbleEvent::ScrobbleAdded { scrobble } => {
                                        log::info!(
                                            "Scrobble added: {} - {}",
                                            scrobble.artist,
                                            scrobble.title
                                        );
                                        let _ = app_for_events.emit("scrobble-added", &scrobble);
                                    }
                                    ScrobbleEvent::PlayerConnected { player } => {
                                        log::info!("Player connected: {}", player);
                                        let _ = app_for_events.emit("player-connected", &player);
                                    }
                                    ScrobbleEvent::PlayerDisconnected { player } => {
                                        log::info!("Player disconnected: {}", player);
                                        let _ = app_for_events.emit("player-disconnected", &player);
                                    }
                                }
                            }
                        });

                        // Start MPRIS listener
                        tauri::async_runtime::spawn(async move {
                            if let Err(e) = mpris.run().await {
                                log::error!("MPRIS listener error: {}", e);
                            }
                        });
                    }
                    Err(e) => {
                        log::error!("Failed to open scrobble queue: {}", e);
                    }
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Scrobble queue
            get_pending_count,
            get_today_count,
            get_recent_scrobbles,
            get_pending_batch,
            mark_batch_synced,
            // Sync
            get_sync_status,
            set_syncing,
            get_next_nonce,
            record_nonce,
            // Now playing
            get_now_playing,
            get_album_art,
            // Auth (scrobbler)
            is_authenticated,
            get_pkp_address,
            get_pkp_public_key,
            get_auth_data,
            start_passkey_auth,
            save_auth,
            sign_out,
            // VPN
            vpn::generate_wg_keypair,
            vpn::start_vpn_auth,
            vpn::export_wg_config,
            vpn::persist_vpn_config,
            vpn::vpn_up,
            vpn::vpn_down,
            vpn::vpn_status,
            vpn::check_vpn_system_ready,
            vpn::forget_vpn_device,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
