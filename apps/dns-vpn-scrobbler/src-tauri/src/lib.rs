use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{Manager, State};
use tokio::sync::RwLock;

// =============================================================================
// Types
// =============================================================================

/// A single scrobble record
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Scrobble {
    pub played_at: i64,      // Unix timestamp (seconds)
    pub dur: u32,            // Duration in seconds
    pub artist: String,
    pub title: String,
    pub source: String,      // e.g., "spotify", "rhythmbox", "vlc"
}

/// Current playback state
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NowPlaying {
    pub title: String,
    pub artist: String,
    pub position: u32,       // Current position in seconds
    pub duration: u32,       // Total duration in seconds
    pub is_playing: bool,
    pub source: String,
}

/// Sync status for the UI
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SyncStatus {
    pub today_count: u32,
    pub pending_count: u32,
    pub last_sync: Option<String>,
    pub is_syncing: bool,
}

/// App configuration
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct AppConfig {
    pub pkp_address: Option<String>,
    pub relay_url: String,
    pub sync_interval_hours: u32,
    pub batch_size: u32,
}

// =============================================================================
// State
// =============================================================================

#[derive(Default)]
struct AppState {
    config: AppConfig,
    now_playing: Option<NowPlaying>,
    db_path: Option<PathBuf>,
}

type SharedState = Arc<RwLock<AppState>>;

// =============================================================================
// Commands - Scrobble Queue
// =============================================================================

/// Get pending scrobble count
#[tauri::command]
async fn get_pending_count(state: State<'_, SharedState>) -> Result<u32, String> {
    let st = state.read().await;
    // TODO: Query SQLite
    let _ = st.db_path.as_ref();
    Ok(0)
}

/// Get today's scrobble count
#[tauri::command]
async fn get_today_count(state: State<'_, SharedState>) -> Result<u32, String> {
    let st = state.read().await;
    // TODO: Query SQLite
    let _ = st.db_path.as_ref();
    Ok(0)
}

/// Get recent scrobbles
#[tauri::command]
async fn get_recent_scrobbles(
    _state: State<'_, SharedState>,
    limit: Option<u32>,
) -> Result<Vec<Scrobble>, String> {
    let _limit = limit.unwrap_or(20);
    // TODO: Query SQLite
    Ok(vec![])
}

/// Add a scrobble to the queue
#[tauri::command]
async fn add_scrobble(
    _state: State<'_, SharedState>,
    scrobble: Scrobble,
) -> Result<(), String> {
    log::info!("Adding scrobble: {} - {}", scrobble.artist, scrobble.title);
    // TODO: Insert into SQLite
    Ok(())
}

// =============================================================================
// Commands - Sync
// =============================================================================

/// Trigger a sync to the relay
#[tauri::command]
async fn sync_now(state: State<'_, SharedState>) -> Result<String, String> {
    let st = state.read().await;

    if st.config.pkp_address.is_none() {
        return Err("Not authenticated. Please sign in first.".into());
    }

    log::info!("Starting sync...");

    // TODO:
    // 1. Query pending scrobbles from SQLite
    // 2. Build NDJSON batch
    // 3. Sign with PKP
    // 4. Send to relay
    // 5. Mark as synced on success

    Ok("Sync complete".into())
}

/// Get current sync status
#[tauri::command]
async fn get_sync_status(state: State<'_, SharedState>) -> Result<SyncStatus, String> {
    let _st = state.read().await;

    Ok(SyncStatus {
        today_count: 0,
        pending_count: 0,
        last_sync: None,
        is_syncing: false,
    })
}

// =============================================================================
// Commands - Now Playing
// =============================================================================

/// Get current now playing info
#[tauri::command]
async fn get_now_playing(state: State<'_, SharedState>) -> Result<Option<NowPlaying>, String> {
    let st = state.read().await;
    Ok(st.now_playing.clone())
}

// =============================================================================
// Commands - Auth
// =============================================================================

/// Check if user is authenticated
#[tauri::command]
async fn is_authenticated(state: State<'_, SharedState>) -> Result<bool, String> {
    let st = state.read().await;
    Ok(st.config.pkp_address.is_some())
}

/// Get PKP address
#[tauri::command]
async fn get_pkp_address(state: State<'_, SharedState>) -> Result<Option<String>, String> {
    let st = state.read().await;
    Ok(st.config.pkp_address.clone())
}

/// Start auth flow (opens browser)
#[tauri::command]
async fn start_auth(
    _app: tauri::AppHandle,
    state: State<'_, SharedState>,
) -> Result<(), String> {
    let st = state.read().await;

    // TODO: Set up local callback server like dns-client
    // For now, just log
    log::info!("Starting auth flow...");
    log::info!("Relay URL: {}", st.config.relay_url);

    // Example: open browser to auth page
    // let auth_url = format!("{}/auth?callback=...", AUTH_PAGE_URL);
    // open::that(&auth_url).map_err(|e| format!("Failed to open browser: {}", e))?;

    Ok(())
}

/// Sign out (clear PKP)
#[tauri::command]
async fn sign_out(state: State<'_, SharedState>) -> Result<(), String> {
    let mut st = state.write().await;
    st.config.pkp_address = None;
    // TODO: Clear from persistent storage
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
            relay_url: "https://scrobble-relay.workers.dev".into(),
            sync_interval_hours: 24,
            batch_size: 500,
        },
        now_playing: None,
        db_path: None,
    }));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(state.clone())
        .setup(move |app| {
            // Set up database path
            let app_dir = app.path().app_data_dir().ok();

            if let Some(ref dir) = app_dir {
                std::fs::create_dir_all(dir).ok();
                let db_path = dir.join("scrobbles.db");

                // Initialize state with db path
                let state_clone = state.clone();
                tauri::async_runtime::block_on(async {
                    let mut st = state_clone.write().await;
                    st.db_path = Some(db_path.clone());
                });

                log::info!("Database path: {:?}", db_path);

                // TODO: Initialize SQLite database
                // init_database(&db_path)?;
            }

            // TODO: Start MPRIS listener for now playing detection
            // spawn_mpris_listener(app.handle().clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Scrobble queue
            get_pending_count,
            get_today_count,
            get_recent_scrobbles,
            add_scrobble,
            // Sync
            sync_now,
            get_sync_status,
            // Now playing
            get_now_playing,
            // Auth
            is_authenticated,
            get_pkp_address,
            start_auth,
            sign_out,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
