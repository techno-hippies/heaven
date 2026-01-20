-- User rules table (blocked domains per user)
CREATE TABLE IF NOT EXISTS user_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, domain)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_user_rules_user_id ON user_rules(user_id);
