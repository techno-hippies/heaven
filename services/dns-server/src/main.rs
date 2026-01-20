//! hp-dns-gw - DNS Gateway for Interest-Based Dating
//!
//! Logs per-wallet DNS queries to Tinybird for interest matching.

mod api;
mod auth;
mod categorize;
mod config;
mod dns;
mod ingest;
mod last_seen;
mod rules;
mod users;

use anyhow::Result;
use std::net::Ipv4Addr;
use std::sync::Arc;
use tokio::sync::broadcast;

use crate::dns::heaven::HeavenResolver;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into()),
        )
        .json()
        .init();

    let config = config::Config::from_env()?;

    tracing::info!("Starting hp-dns-gw");
    tracing::info!("DNS listen: {}", config.dns_listen);
    tracing::info!("API listen: {}", config.api_listen);
    tracing::info!("Upstream: {}", config.upstream_dns);

    // Database connection
    let db = sqlx::PgPool::connect(&config.database_url).await?;
    sqlx::migrate!("./migrations").run(&db).await?;
    tracing::info!("Database connected");

    // User cache with startup hydration
    let user_cache = users::UserCache::new();
    if let Err(e) = user_cache.load_from_db(&db).await {
        tracing::warn!("Failed to hydrate user cache from DB: {} (continuing without cache)", e);
    }

    // Rules cache with startup hydration
    let rules_cache = rules::RulesCache::new();
    if let Err(e) = rules_cache.load_from_db(&db).await {
        tracing::warn!("Failed to hydrate rules cache from DB: {} (continuing without cache)", e);
    }

    // Auth state
    let auth = auth::AuthState::new(&config.jwt_secret, &config.auth_domain);

    // Heaven resolver (optional - only if HEAVEN_API_URL is set)
    let heaven = config.heaven_api_url.as_ref().map(|url| {
        let gateway_ip: Ipv4Addr = config
            .heaven_gateway_ip
            .parse()
            .expect("Invalid HEAVEN_GATEWAY_IP");
        tracing::info!("Heaven resolver enabled: {} -> {}", url, gateway_ip);
        HeavenResolver::new(url.clone(), config.heaven_dns_secret.clone(), gateway_ip)
    });

    // Shared state
    let state = Arc::new(AppState {
        config: config.clone(),
        db,
        user_cache,
        rules_cache,
        auth,
        category_map: categorize::CategoryMap::load()?,
        tinybird: ingest::TinybirdClient::new(&config.tinybird_token, &config.tinybird_endpoint),
        last_seen: last_seen::LastSeenCache::new(),
        heaven,
    });

    // Shutdown signal
    let (shutdown_tx, _) = broadcast::channel::<()>(1);

    // Start DNS server
    let dns_shutdown = shutdown_tx.subscribe();
    let dns_state = state.clone();
    let dns_handle = tokio::spawn(async move {
        if let Err(e) = dns::server::run(dns_state, dns_shutdown).await {
            tracing::error!("DNS server error: {}", e);
        }
    });

    // Start API server
    let api_shutdown = shutdown_tx.subscribe();
    let api_state = state.clone();
    let api_handle = tokio::spawn(async move {
        if let Err(e) = api::run(api_state, api_shutdown).await {
            tracing::error!("API server error: {}", e);
        }
    });

    // Start Tinybird batch sender
    let ingest_shutdown = shutdown_tx.subscribe();
    let ingest_state = state.clone();
    let ingest_handle = tokio::spawn(async move {
        ingest::batch_sender(ingest_state, ingest_shutdown).await;
    });

    // Wait for shutdown
    tokio::signal::ctrl_c().await?;
    tracing::info!("Shutdown signal received");
    let _ = shutdown_tx.send(());

    let _ = tokio::join!(dns_handle, api_handle, ingest_handle);
    tracing::info!("hp-dns-gw stopped");

    Ok(())
}

/// Shared application state
pub struct AppState {
    pub config: config::Config,
    pub db: sqlx::PgPool,
    pub user_cache: users::UserCache,
    pub rules_cache: rules::RulesCache,
    pub auth: auth::AuthState,
    pub category_map: categorize::CategoryMap,
    pub tinybird: ingest::TinybirdClient,
    pub last_seen: last_seen::LastSeenCache,
    /// Optional .heaven TLD resolver (enabled when HEAVEN_API_URL is set)
    pub heaven: Option<HeavenResolver>,
}
