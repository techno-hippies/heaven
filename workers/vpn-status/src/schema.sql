-- DNS Canary table for VPN status checks
-- Stores tokens seen by our DNS resolver

CREATE TABLE IF NOT EXISTS dns_canary (
  token TEXT PRIMARY KEY,
  seen_at INTEGER NOT NULL
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_dns_canary_seen_at ON dns_canary(seen_at);

-- Cleanup old tokens (run periodically via cron trigger)
-- DELETE FROM dns_canary WHERE seen_at < (strftime('%s', 'now') * 1000 - 300000);
