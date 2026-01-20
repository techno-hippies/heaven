//! Scrobble module: MPRIS listening, SQLite queue, and event emission.

pub mod mpris;
pub mod queue;
pub mod state;
pub mod types;

pub use mpris::MprisListener;
pub use queue::ScrobbleQueue;
pub use types::*;
