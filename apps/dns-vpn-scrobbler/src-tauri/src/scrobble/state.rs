//! Player state machine for tracking playback and scrobble timing.

use sha2::{Digest, Sha256};
use std::time::Instant;

use super::types::{PlaybackStatus, TrackInfo};

/// State for a single media player
#[derive(Debug)]
pub struct PlayerState {
    /// DBus bus name (e.g., "org.mpris.MediaPlayer2.spotify")
    #[allow(dead_code)] // Kept for debugging
    pub player_id: String,
    /// Normalized player name for source field
    pub source: String,
    /// Current track metadata
    pub track: Option<TrackInfo>,
    /// Identity hash for change detection
    pub track_identity: Option<String>,
    /// Current playback status
    pub status: PlaybackStatus,

    // Timing
    /// Unix timestamp when current track started playing
    pub track_started_at: i64,
    /// Accumulated play time in milliseconds (pauses excluded)
    pub play_time_ms: u64,
    /// Last known position in milliseconds (for seek detection)
    pub last_position_ms: u64,
    /// When we last updated play_time_ms
    pub last_update: Instant,
    /// Whether we should seed timing from the next non-zero position update
    pub pending_seed: bool,

    // Scrobble state
    /// Whether we've already scrobbled this track
    pub already_scrobbled: bool,
}

impl PlayerState {
    pub fn new(player_id: String) -> Self {
        let source = normalize_source(&player_id);
        Self {
            player_id,
            source,
            track: None,
            track_identity: None,
            status: PlaybackStatus::Stopped,
            track_started_at: 0,
            play_time_ms: 0,
            last_position_ms: 0,
            last_update: Instant::now(),
            pending_seed: false,
            already_scrobbled: false,
        }
    }

    /// Compute identity hash for a track (title + artist only)
    ///
    /// We intentionally exclude album and length because:
    /// - Album metadata often arrives late or changes mid-track
    /// - Length can vary between sources or be corrected
    /// Including them would cause false "track changed" detections.
    fn compute_identity(track: &TrackInfo) -> String {
        // Prefer mpris:trackid if available and non-empty
        if let Some(ref id) = track.track_id {
            if !id.is_empty() && id != "/org/mpris/MediaPlayer2/TrackList/NoTrack" {
                return id.clone();
            }
        }

        // Fallback to normalized hash of title + artist only
        let mut hasher = Sha256::new();
        hasher.update(track.title.to_lowercase().as_bytes());
        hasher.update(b"|");
        hasher.update(track.artist.to_lowercase().as_bytes());

        let result = hasher.finalize();
        format!("{:x}", result)[..16].to_string() // First 16 chars
    }

    /// Update track metadata. Returns true if track changed (new track).
    pub fn update_track(&mut self, track: TrackInfo) -> bool {
        let new_identity = Self::compute_identity(&track);
        let changed = self.track_identity.as_ref() != Some(&new_identity);

        if changed {
            log::info!(
                "[{}] Track changed: {} - {} (identity: {})",
                self.source,
                track.artist,
                track.title,
                &new_identity[..8]
            );
            self.track = Some(track);
            self.track_identity = Some(new_identity);
            self.reset_timing();
        } else {
            // Update track info without resetting timing (e.g., artwork update)
            self.track = Some(track);
        }

        changed
    }

    /// Update playback status. Returns (was_playing, is_playing) for timer management.
    pub fn update_status(&mut self, status: PlaybackStatus) -> (bool, bool) {
        let was_playing = self.status == PlaybackStatus::Playing;
        let is_playing = status == PlaybackStatus::Playing;

        if was_playing && !is_playing {
            // Pausing: accumulate play time
            self.accumulate_play_time();
        } else if !was_playing && is_playing {
            // Resuming: reset update timestamp
            self.last_update = Instant::now();
        }

        self.status = status;
        (was_playing, is_playing)
    }

    /// Update position (for seek detection and time accumulation)
    pub fn update_position(&mut self, position_us: i64) {
        let position_ms = (position_us / 1000).max(0) as u64;

        if self.pending_seed && position_ms > 0 {
            self.seed_from_position(position_us);
            return;
        }

        if self.status == PlaybackStatus::Playing {
            let elapsed = self.last_update.elapsed().as_millis() as u64;
            let expected_pos = self.last_position_ms.saturating_add(elapsed);

            // Allow 2 second tolerance for seek detection
            let diff = (position_ms as i64 - expected_pos as i64).abs() as u64;
            if diff > 2000 {
                log::debug!(
                    "[{}] Seek detected: expected {}ms, got {}ms (diff {}ms)",
                    self.source,
                    expected_pos,
                    position_ms,
                    diff
                );
            }
            // Always accumulate elapsed listening time while playing
            self.play_time_ms = self.play_time_ms.saturating_add(elapsed);
        }

        self.last_position_ms = position_ms;
        self.last_update = Instant::now();
    }

    /// Seed initial state when discovering a track mid-playback
    pub fn seed_from_position(&mut self, position_us: i64) {
        let position_ms = (position_us / 1000).max(0) as u64;
        let position_secs = (position_ms / 1000) as i64;

        // Adjust track_started_at to reflect when the track actually started
        self.track_started_at = chrono_now_unix() - position_secs;
        self.play_time_ms = position_ms;
        self.last_position_ms = position_ms;
        self.last_update = Instant::now();
        self.pending_seed = false;

        log::debug!(
            "[{}] Seeded from position: {}ms, started_at adjusted to {}",
            self.source,
            position_ms,
            self.track_started_at
        );
    }

    /// Reset timing for a new track
    fn reset_timing(&mut self) {
        self.track_started_at = chrono_now_unix();
        self.play_time_ms = 0;
        self.last_position_ms = 0;
        self.last_update = Instant::now();
        self.pending_seed = true;
        self.already_scrobbled = false;
    }

    /// Accumulate play time since last update
    fn accumulate_play_time(&mut self) {
        if self.status == PlaybackStatus::Playing {
            let elapsed = self.last_update.elapsed().as_millis() as u64;
            self.play_time_ms += elapsed;
            // Also update position estimate so now_playing() stays accurate
            self.last_position_ms = self.last_position_ms.saturating_add(elapsed);
            self.last_update = Instant::now();
        }
    }

    /// Get current accumulated play time in seconds
    pub fn play_time_secs(&mut self) -> u32 {
        self.accumulate_play_time();
        (self.play_time_ms / 1000) as u32
    }

    /// Check if scrobble threshold has been reached
    pub fn should_scrobble(&mut self) -> bool {
        if self.already_scrobbled {
            return false;
        }

        let Some(track) = self.track.as_ref() else {
            return false;
        };

        if !track.is_scrobbleable() {
            return false;
        }

        let threshold = track.scrobble_threshold_secs();
        let play_time = self.play_time_secs();

        play_time >= threshold
    }

    /// Mark current track as scrobbled
    pub fn mark_scrobbled(&mut self) {
        self.already_scrobbled = true;
    }

    /// Calculate remaining time until scrobble threshold (for timer scheduling)
    #[allow(dead_code)] // Reserved for future timer-based scrobbling
    pub fn time_until_scrobble_secs(&mut self) -> Option<u32> {
        if self.already_scrobbled {
            return None;
        }

        let Some(track) = self.track.as_ref() else {
            return None;
        };

        if !track.is_scrobbleable() {
            return None;
        }

        let threshold = track.scrobble_threshold_secs();
        let play_time = self.play_time_secs();

        if play_time >= threshold {
            None // Already past threshold
        } else {
            Some(threshold - play_time)
        }
    }

    /// Get current now-playing info
    pub fn now_playing(&self) -> Option<super::types::NowPlaying> {
        let track = self.track.as_ref()?;

        // Calculate current position:
        // - Prefer MPRIS position if we've seen it, otherwise fall back to play_time_ms.
        // - If playing: add elapsed time since last update.
        let base_position_ms = if self.last_position_ms > 0 {
            self.last_position_ms
        } else {
            self.play_time_ms
        };
        let current_position_ms = if self.status == PlaybackStatus::Playing {
            let elapsed_ms = self.last_update.elapsed().as_millis() as u64;
            base_position_ms.saturating_add(elapsed_ms)
        } else {
            base_position_ms
        };

        // Cap at duration to avoid showing position > duration (only if duration is known)
        let duration_ms = (track.length_us / 1000).max(0) as u64;
        let position_ms = if duration_ms > 0 {
            current_position_ms.min(duration_ms)
        } else {
            current_position_ms
        };

        Some(super::types::NowPlaying {
            title: track.title.clone(),
            artist: track.artist.clone(),
            album: track.album.clone(),
            position: (position_ms / 1000) as u32,
            duration: track.length_secs(),
            is_playing: self.status == PlaybackStatus::Playing,
            source: self.source.clone(),
            album_art_url: track.art_url.clone(),
        })
    }
}

/// Normalize player bus name to a simple source identifier
fn normalize_source(bus_name: &str) -> String {
    // org.mpris.MediaPlayer2.spotify -> spotify
    // org.mpris.MediaPlayer2.rhythmbox.instance123 -> rhythmbox
    let stripped = bus_name
        .strip_prefix("org.mpris.MediaPlayer2.")
        .unwrap_or(bus_name);

    // Remove instance suffixes
    stripped
        .split('.')
        .next()
        .unwrap_or(stripped)
        .to_lowercase()
}

/// Get current Unix timestamp
fn chrono_now_unix() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_source() {
        assert_eq!(normalize_source("org.mpris.MediaPlayer2.spotify"), "spotify");
        assert_eq!(normalize_source("org.mpris.MediaPlayer2.rhythmbox"), "rhythmbox");
        assert_eq!(normalize_source("org.mpris.MediaPlayer2.vlc.instance12345"), "vlc");
    }

    #[test]
    fn test_track_identity() {
        let track = TrackInfo {
            track_id: None,
            title: "Karma Police".to_string(),
            artist: "Radiohead".to_string(),
            album: Some("OK Computer".to_string()),
            length_us: 260_000_000, // 4:20
            art_url: None,
            url: None,
        };

        let mut state = PlayerState::new("org.mpris.MediaPlayer2.spotify".to_string());
        assert!(state.update_track(track.clone()));

        // Same track again - should not be "changed"
        assert!(!state.update_track(track));

        // Same track with different album - should NOT be "changed"
        // (album metadata often arrives late)
        let track_diff_album = TrackInfo {
            track_id: None,
            title: "Karma Police".to_string(),
            artist: "Radiohead".to_string(),
            album: Some("OK Computer (Remastered)".to_string()),
            length_us: 260_000_000,
            art_url: None,
            url: None,
        };
        assert!(!state.update_track(track_diff_album));

        // Same track with different length - should NOT be "changed"
        let track_diff_length = TrackInfo {
            track_id: None,
            title: "Karma Police".to_string(),
            artist: "Radiohead".to_string(),
            album: Some("OK Computer".to_string()),
            length_us: 265_000_000, // Slightly different
            art_url: None,
            url: None,
        };
        assert!(!state.update_track(track_diff_length));

        // Different title - SHOULD be "changed"
        let diff_track = TrackInfo {
            track_id: None,
            title: "Paranoid Android".to_string(),
            artist: "Radiohead".to_string(),
            album: Some("OK Computer".to_string()),
            length_us: 380_000_000,
            art_url: None,
            url: None,
        };
        assert!(state.update_track(diff_track));
    }

    #[test]
    fn test_scrobble_threshold() {
        let short_track = TrackInfo {
            track_id: None,
            title: "Short".to_string(),
            artist: "Artist".to_string(),
            album: None,
            length_us: 120_000_000, // 2:00
            art_url: None,
            url: None,
        };
        // 50% of 120s = 60s
        assert_eq!(short_track.scrobble_threshold_secs(), 60);

        let long_track = TrackInfo {
            track_id: None,
            title: "Long".to_string(),
            artist: "Artist".to_string(),
            album: None,
            length_us: 600_000_000, // 10:00
            art_url: None,
            url: None,
        };
        // 50% of 600s = 300s, but capped at 240s
        assert_eq!(long_track.scrobble_threshold_secs(), 240);
    }
}
