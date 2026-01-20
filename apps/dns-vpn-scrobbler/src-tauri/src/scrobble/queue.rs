//! SQLite queue for pending scrobbles.

use rusqlite::{params, Connection, OptionalExtension};
use std::path::Path;
use std::sync::Mutex;

use super::types::{PendingScrobble, Scrobble, SyncStatus};

/// SQLite-backed scrobble queue
pub struct ScrobbleQueue {
    conn: Mutex<Connection>,
}

impl ScrobbleQueue {
    /// Open or create the scrobble database
    pub fn open(path: &Path) -> Result<Self, String> {
        let conn = Connection::open(path)
            .map_err(|e| format!("Failed to open database: {}", e))?;

        // Create tables if they don't exist
        conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS scrobbles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                played_at INTEGER NOT NULL,
                duration INTEGER NOT NULL,
                artist TEXT NOT NULL,
                title TEXT NOT NULL,
                album TEXT,
                source TEXT NOT NULL,
                source_track_id TEXT,
                art_url TEXT,
                synced INTEGER DEFAULT 0,
                batch_cid TEXT,
                batch_tx_hash TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            CREATE INDEX IF NOT EXISTS idx_scrobbles_synced
                ON scrobbles(synced);
            CREATE INDEX IF NOT EXISTS idx_scrobbles_played_at
                ON scrobbles(played_at);

            -- Sync metadata (last sync time, etc.)
            CREATE TABLE IF NOT EXISTS sync_meta (
                key TEXT PRIMARY KEY,
                value TEXT
            );

            -- Nonce tracking for Lit Action (replay protection)
            CREATE TABLE IF NOT EXISTS nonces (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nonce INTEGER NOT NULL UNIQUE,
                tx_hash TEXT,
                cid TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );
            "#,
        )
        .map_err(|e| format!("Failed to create tables: {}", e))?;

        // Migration: add art_url column if missing (for existing databases)
        let has_art_url: bool = conn
            .query_row(
                "SELECT COUNT(*) > 0 FROM pragma_table_info('scrobbles') WHERE name = 'art_url'",
                [],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if !has_art_url {
            conn.execute("ALTER TABLE scrobbles ADD COLUMN art_url TEXT", [])
                .map_err(|e| format!("Failed to add art_url column: {}", e))?;
            log::info!("Migrated database: added art_url column");
        }

        log::info!("Opened scrobble database at {:?}", path);

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    /// Add a scrobble to the queue
    pub fn add_scrobble(
        &self,
        played_at: i64,
        duration: u32,
        artist: &str,
        title: &str,
        album: Option<&str>,
        source: &str,
        source_track_id: Option<&str>,
        art_url: Option<&str>,
    ) -> Result<Scrobble, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        conn.execute(
            r#"
            INSERT INTO scrobbles (played_at, duration, artist, title, album, source, source_track_id, art_url)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#,
            params![played_at, duration, artist, title, album, source, source_track_id, art_url],
        )
        .map_err(|e| format!("Failed to insert scrobble: {}", e))?;

        let id = conn.last_insert_rowid();

        log::info!(
            "Added scrobble #{}: {} - {} ({}s, source: {})",
            id, artist, title, duration, source
        );

        Ok(Scrobble {
            id,
            played_at,
            duration,
            artist: artist.to_string(),
            title: title.to_string(),
            album: album.map(String::from),
            source: source.to_string(),
            source_track_id: source_track_id.map(String::from),
            art_url: art_url.map(String::from),
            synced: false,
            batch_cid: None,
        })
    }

    /// Get pending (unsynced) scrobbles for batching
    pub fn get_pending_batch(&self, limit: u32) -> Result<Vec<PendingScrobble>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                r#"
                SELECT id, played_at, duration, artist, title, album, source
                FROM scrobbles
                WHERE synced = 0
                ORDER BY played_at ASC
                LIMIT ?1
                "#,
            )
            .map_err(|e| format!("Failed to prepare query: {}", e))?;

        let rows = stmt
            .query_map([limit], |row| {
                Ok(PendingScrobble {
                    id: row.get(0)?,
                    played_at: row.get(1)?,
                    dur: row.get(2)?,
                    artist: row.get(3)?,
                    title: row.get(4)?,
                    album: row.get(5)?,
                    source: row.get(6)?,
                })
            })
            .map_err(|e| format!("Failed to query: {}", e))?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row.map_err(|e| format!("Failed to read row: {}", e))?);
        }

        Ok(results)
    }

    /// Mark scrobbles as synced with their batch CID and tx hash
    pub fn mark_batch_synced(
        &self,
        ids: &[i64],
        cid: &str,
        tx_hash: &str,
    ) -> Result<(), String> {
        if ids.is_empty() {
            return Ok(());
        }

        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        // Build placeholders for IN clause
        let placeholders: Vec<String> = ids.iter().map(|_| "?".to_string()).collect();
        let sql = format!(
            "UPDATE scrobbles SET synced = 1, batch_cid = ?1, batch_tx_hash = ?2 WHERE id IN ({})",
            placeholders.join(",")
        );

        let mut stmt = conn
            .prepare(&sql)
            .map_err(|e| format!("Failed to prepare update: {}", e))?;

        // Build params: cid, tx_hash, then all ids
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
        params_vec.push(Box::new(cid.to_string()));
        params_vec.push(Box::new(tx_hash.to_string()));
        for id in ids {
            params_vec.push(Box::new(*id));
        }

        let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

        stmt.execute(params_refs.as_slice())
            .map_err(|e| format!("Failed to mark synced: {}", e))?;

        // Update last sync time
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0);

        conn.execute(
            "INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_sync', ?1)",
            [now.to_string()],
        )
        .ok();

        log::info!(
            "Marked {} scrobbles as synced (CID: {}, tx: {})",
            ids.len(),
            cid,
            tx_hash
        );

        Ok(())
    }

    /// Get count of pending (unsynced) scrobbles
    pub fn get_pending_count(&self) -> Result<u32, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        let count: u32 = conn
            .query_row(
                "SELECT COUNT(*) FROM scrobbles WHERE synced = 0",
                [],
                |row| row.get(0),
            )
            .map_err(|e| format!("Failed to count: {}", e))?;

        Ok(count)
    }

    /// Get count of scrobbles from today (local time)
    pub fn get_today_count(&self) -> Result<u32, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        // Start of today in local time
        let today_start = local_midnight_unix();

        let count: u32 = conn
            .query_row(
                "SELECT COUNT(*) FROM scrobbles WHERE played_at >= ?1",
                [today_start],
                |row| row.get(0),
            )
            .map_err(|e| format!("Failed to count today: {}", e))?;

        Ok(count)
    }

    /// Get recent scrobbles for display
    pub fn get_recent(&self, limit: u32) -> Result<Vec<Scrobble>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                r#"
                SELECT id, played_at, duration, artist, title, album, source,
                       source_track_id, art_url, synced, batch_cid
                FROM scrobbles
                ORDER BY played_at DESC
                LIMIT ?1
                "#,
            )
            .map_err(|e| format!("Failed to prepare query: {}", e))?;

        let rows = stmt
            .query_map([limit], |row| {
                Ok(Scrobble {
                    id: row.get(0)?,
                    played_at: row.get(1)?,
                    duration: row.get(2)?,
                    artist: row.get(3)?,
                    title: row.get(4)?,
                    album: row.get(5)?,
                    source: row.get(6)?,
                    source_track_id: row.get(7)?,
                    art_url: row.get(8)?,
                    synced: row.get::<_, i32>(9)? == 1,
                    batch_cid: row.get(10)?,
                })
            })
            .map_err(|e| format!("Failed to query: {}", e))?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row.map_err(|e| format!("Failed to read row: {}", e))?);
        }

        Ok(results)
    }

    /// Get the next nonce for batch signing (current timestamp if no previous nonce)
    pub fn get_next_nonce(&self) -> Result<u64, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        // Get max nonce used so far
        let max_nonce: Option<u64> = conn
            .query_row(
                "SELECT MAX(nonce) FROM nonces",
                [],
                |row| row.get(0),
            )
            .optional()
            .map_err(|e| format!("Failed to query max nonce: {}", e))?
            .flatten();

        // Next nonce is max + 1, or current timestamp if no previous nonces
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        Ok(max_nonce.map(|n| n + 1).unwrap_or(now))
    }

    /// Record a used nonce after successful batch submission
    pub fn record_nonce(&self, nonce: u64, tx_hash: &str, cid: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO nonces (nonce, tx_hash, cid) VALUES (?1, ?2, ?3)",
            params![nonce, tx_hash, cid],
        )
        .map_err(|e| format!("Failed to record nonce: {}", e))?;

        log::info!("Recorded nonce {} (tx: {}, cid: {})", nonce, tx_hash, cid);

        Ok(())
    }

    /// Get sync status for the UI
    pub fn get_sync_status(&self) -> Result<SyncStatus, String> {
        let pending_count = self.get_pending_count()?;
        let today_count = self.get_today_count()?;

        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        let last_sync: Option<String> = conn
            .query_row(
                "SELECT value FROM sync_meta WHERE key = 'last_sync'",
                [],
                |row| row.get(0),
            )
            .optional()
            .map_err(|e| format!("Failed to query last sync: {}", e))?
            .and_then(|ts: String| {
                // Convert Unix timestamp to ISO string
                ts.parse::<i64>().ok().map(|t| {
                    chrono_format_iso(t)
                })
            });

        Ok(SyncStatus {
            today_count,
            pending_count,
            last_sync,
            is_syncing: false, // Managed at app level
        })
    }
}

/// Format Unix timestamp as ISO 8601 string (UTC)
fn chrono_format_iso(timestamp: i64) -> String {
    // Calculate date/time components from Unix timestamp
    let secs = timestamp;
    let days = secs / 86400;
    let day_secs = secs % 86400;

    let hours = day_secs / 3600;
    let minutes = (day_secs % 3600) / 60;
    let seconds = day_secs % 60;

    // Calculate year/month/day from days since epoch (1970-01-01)
    let (year, month, day) = days_to_ymd(days);

    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z",
        year, month, day, hours, minutes, seconds
    )
}

/// Convert days since Unix epoch to year/month/day
fn days_to_ymd(days: i64) -> (i32, u32, u32) {
    // Simplified calculation - good enough for recent dates
    let mut remaining = days;
    let mut year = 1970i32;

    loop {
        let days_in_year = if is_leap_year(year) { 366 } else { 365 };
        if remaining < days_in_year {
            break;
        }
        remaining -= days_in_year;
        year += 1;
    }

    let leap = is_leap_year(year);
    let days_in_months: [i64; 12] = if leap {
        [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    } else {
        [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    };

    let mut month = 1u32;
    for &days_in_month in &days_in_months {
        if remaining < days_in_month {
            break;
        }
        remaining -= days_in_month;
        month += 1;
    }

    let day = (remaining + 1) as u32; // Days are 1-indexed
    (year, month, day)
}

fn is_leap_year(year: i32) -> bool {
    (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
}

/// Get Unix timestamp for local midnight today
fn local_midnight_unix() -> i64 {
    use std::time::SystemTime;

    let now = SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    // Get local timezone offset (approximate using libc on Unix)
    #[cfg(unix)]
    let offset_secs = {
        // Use localtime to get the offset
        unsafe {
            let time = now as libc::time_t;
            let mut tm: libc::tm = std::mem::zeroed();
            libc::localtime_r(&time, &mut tm);
            tm.tm_gmtoff as i64
        }
    };

    #[cfg(not(unix))]
    let offset_secs: i64 = 0; // Fallback to UTC on non-Unix

    // Convert to local time, find midnight, convert back to UTC
    let local_now = now + offset_secs;
    let local_midnight = local_now - (local_now % 86400);
    local_midnight - offset_secs
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::time::{SystemTime, UNIX_EPOCH};

    static DB_COUNTER: AtomicUsize = AtomicUsize::new(0);

    fn temp_db() -> (ScrobbleQueue, PathBuf) {
        let count = DB_COUNTER.fetch_add(1, Ordering::Relaxed);
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0);
        let path = std::env::temp_dir().join(format!(
            "scrobble_test_{}_{}_{}.db",
            std::process::id(),
            nanos,
            count
        ));
        let _ = std::fs::remove_file(&path); // Clean up any existing
        let queue = ScrobbleQueue::open(&path).unwrap();
        (queue, path)
    }

    #[test]
    fn test_add_and_get_pending() {
        let (queue, path) = temp_db();

        let scrobble = queue
            .add_scrobble(
                1700000000,
                180,
                "Radiohead",
                "Karma Police",
                Some("OK Computer"),
                "spotify",
                Some("abc123"),
                Some("https://example.com/art.jpg"),
            )
            .unwrap();

        assert_eq!(scrobble.artist, "Radiohead");
        assert!(!scrobble.synced);

        let pending = queue.get_pending_batch(10).unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].artist, "Radiohead");

        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn test_mark_synced() {
        let (queue, path) = temp_db();

        queue
            .add_scrobble(1700000000, 180, "Artist", "Track", None, "vlc", None, None)
            .unwrap();

        let pending = queue.get_pending_batch(10).unwrap();
        assert_eq!(pending.len(), 1);
        let id = pending[0].id;

        queue
            .mark_batch_synced(&[id], "QmABC123", "0xdef456")
            .unwrap();

        let pending_after = queue.get_pending_batch(10).unwrap();
        assert_eq!(pending_after.len(), 0);

        let _ = std::fs::remove_file(path);
    }
}
