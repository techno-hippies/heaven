//! MPRIS/DBus listener for detecting media playback on Linux.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use tokio::sync::{mpsc, RwLock};
use zbus::fdo::DBusProxy;
use zbus::zvariant::OwnedValue;
use zbus::{Connection, MatchRule, MessageStream, MessageType};

use super::queue::ScrobbleQueue;
use super::state::PlayerState;
use super::types::{PlaybackStatus, ScrobbleEvent, TrackInfo, IGNORED_PLAYERS};

const MPRIS_PREFIX: &str = "org.mpris.MediaPlayer2.";
const MPRIS_PLAYER_IFACE: &str = "org.mpris.MediaPlayer2.Player";
const PROPERTIES_IFACE: &str = "org.freedesktop.DBus.Properties";

/// MPRIS listener that tracks all active media players
pub struct MprisListener {
    queue: Arc<ScrobbleQueue>,
    players: Arc<RwLock<HashMap<String, PlayerState>>>,
    /// Map from unique bus name (:1.123) to well-known name (org.mpris.MediaPlayer2.spotify)
    unique_to_wellknown: Arc<RwLock<HashMap<String, String>>>,
    event_tx: mpsc::UnboundedSender<ScrobbleEvent>,
}

impl MprisListener {
    pub fn new(
        queue: Arc<ScrobbleQueue>,
        event_tx: mpsc::UnboundedSender<ScrobbleEvent>,
    ) -> Self {
        Self {
            queue,
            players: Arc::new(RwLock::new(HashMap::new())),
            unique_to_wellknown: Arc::new(RwLock::new(HashMap::new())),
            event_tx,
        }
    }

    /// Start listening for MPRIS events
    pub async fn run(self: Arc<Self>) -> Result<(), String> {
        let conn = Connection::session()
            .await
            .map_err(|e| format!("Failed to connect to session bus: {}", e))?;

        log::info!("Connected to DBus session bus");

        // Discover existing players
        self.discover_players(&conn).await?;

        // Watch for new players appearing/disappearing
        let self_clone = Arc::clone(&self);
        let conn_clone = conn.clone();
        tokio::spawn(async move {
            if let Err(e) = self_clone.watch_name_changes(&conn_clone).await {
                log::error!("Name watcher error: {}", e);
            }
        });

        // Watch for PropertiesChanged signals from MPRIS players
        let self_props = Arc::clone(&self);
        let conn_props = conn.clone();
        tokio::spawn(async move {
            if let Err(e) = self_props.watch_properties_changed(&conn_props).await {
                log::error!("PropertiesChanged watcher error: {}", e);
            }
        });

        // Main polling loop for scrobble thresholds
        loop {
            tokio::time::sleep(Duration::from_secs(1)).await;
            self.check_scrobble_thresholds().await;
        }
    }

    /// Watch for PropertiesChanged signals from all MPRIS players
    async fn watch_properties_changed(&self, conn: &Connection) -> Result<(), String> {
        use futures_util::StreamExt;

        // Match rule for PropertiesChanged on any MPRIS player
        let rule = MatchRule::builder()
            .msg_type(MessageType::Signal)
            .interface(PROPERTIES_IFACE)
            .map_err(|e| format!("Invalid interface: {}", e))?
            .member("PropertiesChanged")
            .map_err(|e| format!("Invalid member: {}", e))?
            .build();

        let mut stream = MessageStream::for_match_rule(rule, conn, None)
            .await
            .map_err(|e| format!("Failed to create message stream: {}", e))?;

        log::info!("Watching for PropertiesChanged signals");

        while let Some(msg) = stream.next().await {
            let msg = match msg {
                Ok(m) => m,
                Err(e) => {
                    log::warn!("Error receiving message: {}", e);
                    continue;
                }
            };

            // Get sender (bus name)
            let header = msg.header();
            let Some(sender) = header.sender() else {
                continue;
            };
            let sender_str = sender.as_str();

            // Only handle MPRIS players
            if !sender_str.starts_with(MPRIS_PREFIX) && !sender_str.starts_with(":") {
                continue;
            }

            // Parse PropertiesChanged body: (interface_name, changed_props, invalidated_props)
            let body: Result<(String, HashMap<String, OwnedValue>, Vec<String>), _> =
                msg.body().deserialize();

            let Ok((iface, changed, _invalidated)) = body else {
                continue;
            };

            // Only handle Player interface changes
            if iface != MPRIS_PLAYER_IFACE {
                continue;
            }

            // Find matching player by unique name or well-known name
            self.handle_properties_changed(conn, sender_str, changed)
                .await;
        }

        Ok(())
    }

    /// Handle PropertiesChanged signal for a player
    async fn handle_properties_changed(
        &self,
        conn: &Connection,
        sender: &str,
        changed: HashMap<String, OwnedValue>,
    ) {
        // Resolve sender to well-known name if it's a unique name
        let well_known_name = if sender.starts_with(":") {
            let mapping = self.unique_to_wellknown.read().await;
            mapping.get(sender).cloned()
        } else if sender.starts_with(MPRIS_PREFIX) {
            Some(sender.to_string())
        } else {
            None
        };

        let Some(player_key) = well_known_name else {
            // Unknown unique name - might be a new player we haven't seen yet
            log::debug!("PropertiesChanged from unknown sender: {}", sender);
            return;
        };

        let mut players = self.players.write().await;

        let Some(state) = players.get_mut(&player_key) else {
            // Player not tracked, might need to add it
            if !self.is_ignored(&player_key) {
                drop(players);
                self.add_player(conn, player_key).await;
            }
            return;
        };

        let mut emit_now_playing = false;

        // Process changed properties
        if let Some(metadata) = changed.get("Metadata") {
            if let Some(track) = parse_metadata(metadata) {
                if state.update_track(track) {
                    emit_now_playing = true;
                    log::info!(
                        "[{}] Track changed via signal: {} - {}",
                        state.source,
                        state.track.as_ref().map(|t| t.artist.as_str()).unwrap_or("?"),
                        state.track.as_ref().map(|t| t.title.as_str()).unwrap_or("?")
                    );
                }
            }
        }

        if let Some(status_val) = changed.get("PlaybackStatus") {
            if let Ok(s) = <&str>::try_from(status_val) {
                let status = PlaybackStatus::from_str(s);
                let (was_playing, is_playing) = state.update_status(status);
                if was_playing != is_playing {
                    emit_now_playing = true;
                    log::info!("[{}] Playback status: {:?}", state.source, status);
                }
            }
        }

        if let Some(pos_val) = changed.get("Position") {
            if let Ok(p) = <i64>::try_from(pos_val) {
                state.update_position(p);
            }
        }

        // Emit now-playing update if needed
        if emit_now_playing {
            let now_playing = if state.status == PlaybackStatus::Playing {
                state.now_playing()
            } else {
                None
            };
            let _ = self.event_tx.send(ScrobbleEvent::NowPlayingChanged { now_playing });
        }
    }

    /// Discover existing MPRIS players on the bus
    async fn discover_players(&self, conn: &Connection) -> Result<(), String> {
        let dbus = DBusProxy::new(conn)
            .await
            .map_err(|e| format!("Failed to create DBus proxy: {}", e))?;

        let names = dbus
            .list_names()
            .await
            .map_err(|e| format!("Failed to list names: {}", e))?;

        for name in names {
            let name_str = name.as_str();
            if name_str.starts_with(MPRIS_PREFIX) && !self.is_ignored(name_str) {
                log::info!("Discovered player: {}", name_str);
                self.add_player(conn, name_str.to_string()).await;
            }
        }

        Ok(())
    }

    /// Check if a player should be ignored
    fn is_ignored(&self, bus_name: &str) -> bool {
        let name_lower = bus_name.to_lowercase();
        IGNORED_PLAYERS.iter().any(|&p| name_lower.contains(p))
    }

    /// Add a new player and load its initial state
    async fn add_player(&self, conn: &Connection, bus_name: String) {
        // Check if already tracked
        {
            let players = self.players.read().await;
            if players.contains_key(&bus_name) {
                return;
            }
        }

        // Resolve unique name for this well-known name
        if let Ok(unique_name) = self.get_name_owner(conn, &bus_name).await {
            let mut mapping = self.unique_to_wellknown.write().await;
            mapping.insert(unique_name.clone(), bus_name.clone());
            log::debug!("Mapped {} -> {}", unique_name, bus_name);
        }

        let mut state = PlayerState::new(bus_name.clone());
        let mut initial_position: Option<i64> = None;

        // Load initial properties via Properties.GetAll
        if let Ok(props) = self.get_player_properties(conn, &bus_name).await {
            if let Some(metadata) = props.get("Metadata") {
                if let Some(track) = parse_metadata(metadata) {
                    state.update_track(track);
                }
            }
            if let Some(status) = props.get("PlaybackStatus") {
                if let Ok(s) = <&str>::try_from(status) {
                    state.update_status(PlaybackStatus::from_str(s));
                }
            }
            if let Some(pos) = props.get("Position") {
                if let Ok(p) = <i64>::try_from(pos) {
                    initial_position = Some(p);
                }
            }
        }

        // If player is already playing with a position, seed from that position
        // This handles app startup when music is already playing
        if state.status == PlaybackStatus::Playing {
            if let Some(pos) = initial_position {
                if pos > 0 {
                    state.seed_from_position(pos);
                }
            }
        }

        let _ = self.event_tx.send(ScrobbleEvent::PlayerConnected {
            player: state.source.clone(),
        });

        // Emit initial now-playing if applicable
        if state.status == PlaybackStatus::Playing {
            let _ = self.event_tx.send(ScrobbleEvent::NowPlayingChanged {
                now_playing: state.now_playing(),
            });
        }

        let mut players = self.players.write().await;
        players.insert(bus_name, state);
    }

    /// Get the unique name (:1.x) for a well-known name
    async fn get_name_owner(&self, conn: &Connection, well_known: &str) -> Result<String, zbus::Error> {
        let dbus = DBusProxy::new(conn).await?;
        let owner = dbus.get_name_owner(well_known.try_into()?).await?;
        Ok(owner.to_string())
    }

    /// Remove a player
    async fn remove_player(&self, bus_name: &str, unique_name: Option<&str>) {
        // Clean up unique name mapping
        if let Some(unique) = unique_name {
            let mut mapping = self.unique_to_wellknown.write().await;
            mapping.remove(unique);
        }

        let mut players = self.players.write().await;

        if let Some(state) = players.remove(bus_name) {
            log::info!("Player disconnected: {}", state.source);
            let _ = self.event_tx.send(ScrobbleEvent::PlayerDisconnected {
                player: state.source,
            });

            // Check if we need to clear now-playing
            let any_playing = players.values().any(|p| p.status == PlaybackStatus::Playing);
            if !any_playing {
                let _ = self.event_tx.send(ScrobbleEvent::NowPlayingChanged {
                    now_playing: None,
                });
            }
        }
    }

    /// Get current player properties via DBus
    async fn get_player_properties(
        &self,
        conn: &Connection,
        bus_name: &str,
    ) -> Result<HashMap<String, OwnedValue>, zbus::Error> {
        use zbus::names::InterfaceName;

        let proxy = zbus::fdo::PropertiesProxy::builder(conn)
            .destination(bus_name)?
            .path("/org/mpris/MediaPlayer2")?
            .build()
            .await?;

        let iface_name = InterfaceName::from_static_str_unchecked(MPRIS_PLAYER_IFACE);
        let props = proxy.get_all(Some(iface_name).into()).await?;
        Ok(props)
    }

    /// Watch for bus name changes (player connect/disconnect)
    async fn watch_name_changes(&self, conn: &Connection) -> Result<(), String> {
        let dbus = DBusProxy::new(conn)
            .await
            .map_err(|e| format!("Failed to create DBus proxy: {}", e))?;

        let mut stream = dbus
            .receive_name_owner_changed()
            .await
            .map_err(|e| format!("Failed to watch names: {}", e))?;

        use futures_util::StreamExt;

        while let Some(signal) = stream.next().await {
            if let Ok(args) = signal.args() {
                let name = args.name.as_str();

                if !name.starts_with(MPRIS_PREFIX) || self.is_ignored(name) {
                    continue;
                }

                let old_owner = args.old_owner.as_ref().map(|s| s.as_str()).unwrap_or("");
                let new_owner = args.new_owner.as_ref().map(|s| s.as_str()).unwrap_or("");

                if old_owner.is_empty() && !new_owner.is_empty() {
                    // Player appeared
                    log::info!("Player appeared: {}", name);
                    self.add_player(conn, name.to_string()).await;
                } else if !old_owner.is_empty() && new_owner.is_empty() {
                    // Player disappeared - old_owner is the unique name
                    log::info!("Player disappeared: {} (was {})", name, old_owner);
                    self.remove_player(name, Some(old_owner)).await;
                }
            }
        }

        Ok(())
    }

    /// Check all players for scrobble thresholds
    async fn check_scrobble_thresholds(&self) {
        let mut players = self.players.write().await;

        for (_bus_name, state) in players.iter_mut() {
            if state.status != PlaybackStatus::Playing {
                continue;
            }

            if state.should_scrobble() {
                // Clone track info before borrowing state mutably
                let track_info = state.track.clone();
                let started_at = state.track_started_at;
                let source = state.source.clone();
                let play_time = state.play_time_secs();

                if let Some(track) = track_info {
                    let result = self.queue.add_scrobble(
                        started_at,
                        play_time,
                        &track.artist,
                        &track.title,
                        track.album.as_deref(),
                        &source,
                        track.extract_source_track_id().as_deref(),
                        track.art_url.as_deref(),
                    );

                    match result {
                        Ok(scrobble) => {
                            log::info!(
                                "Scrobbled: {} - {} ({} secs)",
                                track.artist,
                                track.title,
                                play_time
                            );
                            let _ = self.event_tx.send(ScrobbleEvent::ScrobbleAdded { scrobble });
                        }
                        Err(e) => {
                            log::error!("Failed to add scrobble: {}", e);
                        }
                    }
                }

                state.mark_scrobbled();
            }
        }
    }

    /// Get current now-playing state (for UI polling)
    pub async fn get_now_playing(&self) -> Option<super::types::NowPlaying> {
        let players = self.players.read().await;

        // Return the first playing player's now-playing
        for state in players.values() {
            if state.status == PlaybackStatus::Playing {
                return state.now_playing();
            }
        }

        None
    }
}

/// Parse MPRIS Metadata variant into TrackInfo
fn parse_metadata(value: &OwnedValue) -> Option<TrackInfo> {
    // Metadata is a{sv} - dictionary of string to variant
    let dict: HashMap<String, OwnedValue> = value.try_clone().ok()?.try_into().ok()?;

    let mut track = TrackInfo::default();

    for (key, val) in dict.iter() {
        match key.as_str() {
            "mpris:trackid" => {
                // ObjectPath comes as a string in the Value
                if let Ok(s) = <&str>::try_from(val) {
                    track.track_id = Some(s.to_string());
                }
            }
            "xesam:title" => {
                if let Ok(s) = <&str>::try_from(val) {
                    track.title = s.to_string();
                }
            }
            "xesam:artist" => {
                // Can be array of strings
                if let Some(cloned) = val.try_clone().ok() {
                    if let Ok(arr) = <Vec<String>>::try_from(cloned) {
                        track.artist = arr.join(", ");
                    }
                }
                // Fallback to single string
                if track.artist.is_empty() {
                    if let Ok(s) = <&str>::try_from(val) {
                        track.artist = s.to_string();
                    }
                }
            }
            "xesam:album" => {
                if let Ok(s) = <&str>::try_from(val) {
                    track.album = Some(s.to_string());
                }
            }
            "mpris:length" => {
                if let Ok(l) = <i64>::try_from(val) {
                    track.length_us = l;
                } else if let Ok(l) = <u64>::try_from(val) {
                    track.length_us = l as i64;
                }
            }
            "mpris:artUrl" => {
                if let Ok(s) = <&str>::try_from(val) {
                    track.art_url = Some(s.to_string());
                }
            }
            "xesam:url" => {
                if let Ok(s) = <&str>::try_from(val) {
                    track.url = Some(s.to_string());
                }
            }
            _ => {}
        }
    }

    // Must have at least title and artist
    if track.title.is_empty() || track.artist.is_empty() {
        return None;
    }

    Some(track)
}
