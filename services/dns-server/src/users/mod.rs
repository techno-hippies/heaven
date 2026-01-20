//! User management and VPN IP lookup

use dashmap::DashMap;
use std::net::IpAddr;
use std::sync::Arc;
use uuid::Uuid;

/// Cached user info for DNS lookups
#[derive(Debug, Clone)]
pub struct CachedUser {
    pub user_id: Uuid,
    pub wallet_address: String,
    pub device_id: Uuid,
    pub vpn_ip: IpAddr,
}

/// Thread-safe user cache keyed by VPN IP
pub struct UserCache {
    by_ip: Arc<DashMap<IpAddr, CachedUser>>,
}

impl UserCache {
    pub fn new() -> Self {
        Self {
            by_ip: Arc::new(DashMap::new()),
        }
    }

    /// Get user by VPN IP address
    pub async fn get_by_ip(&self, ip: &IpAddr) -> Option<CachedUser> {
        self.by_ip.get(ip).map(|r| r.value().clone())
    }

    /// Add or update user in cache
    pub fn upsert(&self, user: CachedUser) {
        self.by_ip.insert(user.vpn_ip, user);
    }

    /// Remove user from cache
    pub fn remove(&self, ip: &IpAddr) {
        self.by_ip.remove(ip);
    }

    /// Get number of cached users
    pub fn len(&self) -> usize {
        self.by_ip.len()
    }

    /// Load all users from database into cache
    pub async fn load_from_db(&self, db: &sqlx::PgPool) -> anyhow::Result<()> {
        let rows = sqlx::query_as::<_, (Uuid, String, Uuid, String)>(
            r#"
            SELECT u.id, u.wallet_address, d.id, host(d.vpn_ip)
            FROM users u
            JOIN devices d ON d.user_id = u.id
            "#
        )
        .fetch_all(db)
        .await?;

        for (user_id, wallet_address, device_id, vpn_ip_str) in rows {
            if let Ok(vpn_ip) = vpn_ip_str.parse::<IpAddr>() {
                self.upsert(CachedUser {
                    user_id,
                    wallet_address,
                    device_id,
                    vpn_ip,
                });
            }
        }

        tracing::info!("Loaded {} devices into user cache", self.by_ip.len());
        Ok(())
    }
}

impl Default for UserCache {
    fn default() -> Self {
        Self::new()
    }
}
