//! Shared types for the scrobble module.

use serde::{Deserialize, Serialize};

/// Scrobble thresholds per Last.fm rules
pub const MIN_TRACK_LENGTH_SECS: u32 = 30;
pub const SCROBBLE_THRESHOLD_SECS: u32 = 240; // 4 minutes
pub const SCROBBLE_THRESHOLD_PERCENT: f32 = 0.5; // 50%

/// Now-playing update interval (optional periodic updates)
#[allow(dead_code)] // Reserved for future now-playing feature
pub const NOW_PLAYING_INTERVAL_SECS: u64 = 65;

/// Players to ignore (browser noise, etc.)
pub const IGNORED_PLAYERS: &[&str] = &[
    "firefox",
    "chromium",
    "chrome",
    "brave",
    "plasma-browser-integration",
    "kdeconnect",
];

/// A scrobble record stored in SQLite and sent to the frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Scrobble {
    pub id: i64,
    pub played_at: i64,      // Unix timestamp when track started
    pub duration: u32,       // Actual listened time in seconds
    pub artist: String,
    pub title: String,
    pub album: Option<String>,
    pub source: String,      // Player name (spotify, rhythmbox, etc.)
    pub source_track_id: Option<String>, // e.g., Spotify track ID
    pub art_url: Option<String>, // Album art URL (data: or http://)
    pub synced: bool,
    pub batch_cid: Option<String>,
}

/// A pending scrobble for batch submission (no id, not yet synced)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingScrobble {
    pub id: i64,
    pub played_at: i64,
    pub dur: u32,            // Matches contract field name
    pub artist: String,
    pub title: String,
    pub album: Option<String>,
    pub source: String,
}

/// Current playback state emitted to the frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NowPlaying {
    pub title: String,
    pub artist: String,
    pub album: Option<String>,
    pub position: u32,       // Current position in seconds
    pub duration: u32,       // Track duration in seconds
    pub is_playing: bool,
    pub source: String,
    pub album_art_url: Option<String>,
}

/// Sync status for the UI
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncStatus {
    pub today_count: u32,
    pub pending_count: u32,
    pub last_sync: Option<String>, // ISO timestamp
    pub is_syncing: bool,
}

/// Track metadata from MPRIS
#[derive(Debug, Clone, Default)]
pub struct TrackInfo {
    pub track_id: Option<String>,    // mpris:trackid
    pub title: String,
    pub artist: String,
    pub album: Option<String>,
    pub length_us: i64,              // Duration in microseconds
    pub art_url: Option<String>,
    pub url: Option<String>,         // xesam:url (for Spotify ID extraction)
}

impl TrackInfo {
    /// Extract source-specific track ID (e.g., Spotify track ID from URL)
    pub fn extract_source_track_id(&self) -> Option<String> {
        // Spotify: spotify:track:ABC123 or https://open.spotify.com/track/ABC123
        if let Some(ref url) = self.url {
            if url.starts_with("spotify:track:") {
                return Some(url.strip_prefix("spotify:track:")?.to_string());
            }
            if url.contains("open.spotify.com/track/") {
                return url.split("/track/").nth(1).map(|s| {
                    s.split('?').next().unwrap_or(s).to_string()
                });
            }
        }
        if let Some(ref track_id) = self.track_id {
            if track_id.starts_with("spotify:track:") {
                return Some(track_id.strip_prefix("spotify:track:")?.to_string());
            }
        }
        None
    }

    /// Duration in seconds
    pub fn length_secs(&self) -> u32 {
        (self.length_us / 1_000_000).max(0) as u32
    }

    /// Check if track meets minimum length requirement
    pub fn is_scrobbleable(&self) -> bool {
        self.length_secs() >= MIN_TRACK_LENGTH_SECS
    }

    /// Calculate scrobble threshold in seconds: min(4 min, 50% of length)
    pub fn scrobble_threshold_secs(&self) -> u32 {
        let half_length = (self.length_secs() as f32 * SCROBBLE_THRESHOLD_PERCENT) as u32;
        half_length.min(SCROBBLE_THRESHOLD_SECS)
    }
}

/// Playback status from MPRIS
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum PlaybackStatus {
    Playing,
    Paused,
    #[default]
    Stopped,
}

impl PlaybackStatus {
    pub fn from_str(s: &str) -> Self {
        match s {
            "Playing" => Self::Playing,
            "Paused" => Self::Paused,
            _ => Self::Stopped,
        }
    }
}

/// Events emitted from the MPRIS listener to the frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ScrobbleEvent {
    /// Now playing changed (new track or resumed)
    #[serde(rename_all = "camelCase")]
    NowPlayingChanged {
        now_playing: Option<NowPlaying>,
    },
    /// A scrobble was added to the queue
    #[serde(rename_all = "camelCase")]
    ScrobbleAdded {
        scrobble: Scrobble,
    },
    /// Player connected
    #[serde(rename_all = "camelCase")]
    PlayerConnected {
        player: String,
    },
    /// Player disconnected
    #[serde(rename_all = "camelCase")]
    PlayerDisconnected {
        player: String,
    },
}
