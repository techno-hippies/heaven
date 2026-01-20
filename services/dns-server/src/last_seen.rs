//! Device last-seen tracking for status endpoint

use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::sync::RwLock;
use uuid::Uuid;

/// Tracks when devices were last seen (via DNS queries)
pub struct LastSeenCache {
    /// device_id -> last seen timestamp
    by_device: RwLock<HashMap<Uuid, DateTime<Utc>>>,
}

impl LastSeenCache {
    pub fn new() -> Self {
        Self {
            by_device: RwLock::new(HashMap::new()),
        }
    }

    /// Record a device as seen now
    pub fn touch(&self, device_id: Uuid) {
        if let Ok(mut map) = self.by_device.write() {
            map.insert(device_id, Utc::now());
        }
    }

    /// Get when a device was last seen
    pub fn get(&self, device_id: &Uuid) -> Option<DateTime<Utc>> {
        self.by_device.read().ok()?.get(device_id).copied()
    }

    /// Check if device was seen within N minutes
    pub fn is_connected(&self, device_id: &Uuid, minutes: i64) -> bool {
        if let Some(last_seen) = self.get(device_id) {
            let now = Utc::now();
            let diff = now.signed_duration_since(last_seen);
            diff.num_minutes() < minutes
        } else {
            false
        }
    }
}

impl Default for LastSeenCache {
    fn default() -> Self {
        Self::new()
    }
}
