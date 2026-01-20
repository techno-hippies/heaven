-- Users table (wallet-based identity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Devices table (WireGuard peers)
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    wg_pubkey TEXT UNIQUE NOT NULL,
    vpn_ip INET UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast IP lookups (used on every DNS query)
CREATE INDEX IF NOT EXISTS idx_devices_vpn_ip ON devices(vpn_ip);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
