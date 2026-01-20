//! User rules cache for DNS blocking
//!
//! Maintains an in-memory cache of blocked domains per user,
//! loaded from Postgres and updated via API.

use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Cache of blocked domains per user
pub struct RulesCache {
    /// user_id -> set of blocked domains (normalized, lowercase)
    blocked: Arc<RwLock<HashMap<Uuid, HashSet<String>>>>,
}

impl RulesCache {
    pub fn new() -> Self {
        Self {
            blocked: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Load rules from database at startup
    pub async fn load_from_db(&self, db: &sqlx::PgPool) -> Result<(), sqlx::Error> {
        let rows = sqlx::query_as::<_, (Uuid, String)>(
            "SELECT user_id, domain FROM user_rules"
        )
        .fetch_all(db)
        .await?;

        let mut cache = self.blocked.write().await;
        cache.clear();

        for (user_id, domain) in rows {
            cache
                .entry(user_id)
                .or_insert_with(HashSet::new)
                .insert(domain.to_lowercase());
        }

        tracing::info!(
            users = cache.len(),
            total_rules = cache.values().map(|s| s.len()).sum::<usize>(),
            "Rules cache loaded"
        );

        Ok(())
    }

    /// Check if a domain is blocked for a user
    /// Also checks parent domains (e.g., blocks "xxx.example.com" if "example.com" is blocked)
    pub async fn is_blocked(&self, user_id: &Uuid, domain: &str) -> bool {
        let cache = self.blocked.read().await;

        if let Some(blocked_set) = cache.get(user_id) {
            let domain_lower = domain.to_lowercase();

            // Check exact match
            if blocked_set.contains(&domain_lower) {
                return true;
            }

            // Check parent domains (e.g., if "example.com" is blocked, "sub.example.com" is also blocked)
            let mut parts: Vec<&str> = domain_lower.split('.').collect();
            while parts.len() > 1 {
                parts.remove(0);
                let parent = parts.join(".");
                if blocked_set.contains(&parent) {
                    return true;
                }
            }
        }

        false
    }

    /// Get all blocked domains for a user
    pub async fn get_blocked_domains(&self, user_id: &Uuid) -> Vec<String> {
        let cache = self.blocked.read().await;
        cache
            .get(user_id)
            .map(|s| s.iter().cloned().collect())
            .unwrap_or_default()
    }

    /// Set blocked domains for a user (replaces existing)
    pub async fn set_blocked_domains(&self, user_id: Uuid, domains: Vec<String>) {
        let mut cache = self.blocked.write().await;
        let set: HashSet<String> = domains.into_iter().map(|d| d.to_lowercase()).collect();
        cache.insert(user_id, set);
    }

    /// Add a single blocked domain for a user
    #[allow(dead_code)]
    pub async fn add_blocked_domain(&self, user_id: Uuid, domain: String) {
        let mut cache = self.blocked.write().await;
        cache
            .entry(user_id)
            .or_insert_with(HashSet::new)
            .insert(domain.to_lowercase());
    }

    /// Remove a single blocked domain for a user
    #[allow(dead_code)]
    pub async fn remove_blocked_domain(&self, user_id: &Uuid, domain: &str) {
        let mut cache = self.blocked.write().await;
        if let Some(set) = cache.get_mut(user_id) {
            set.remove(&domain.to_lowercase());
        }
    }
}

impl Default for RulesCache {
    fn default() -> Self {
        Self::new()
    }
}
