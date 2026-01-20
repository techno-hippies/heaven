//! Configuration from environment variables

use anyhow::{Context, Result};
use clap::Parser;

#[derive(Parser, Debug, Clone)]
#[command(name = "hp-dns-gw", about = "DNS Gateway for Interest-Based Dating")]
pub struct Config {
    /// DNS server listen address
    #[arg(long, env = "DNS_LISTEN", default_value = "10.8.0.1:53")]
    pub dns_listen: String,

    /// DNS bind retry interval in milliseconds (only on address-not-available)
    #[arg(long, env = "DNS_BIND_RETRY_MS", default_value = "250")]
    pub dns_bind_retry_ms: u64,

    /// DNS bind retry attempts before giving up (0 = infinite)
    #[arg(long, env = "DNS_BIND_RETRIES", default_value = "0")]
    pub dns_bind_retries: u32,

    /// API server listen address
    #[arg(long, env = "API_LISTEN", default_value = "0.0.0.0:8080")]
    pub api_listen: String,

    /// Upstream DNS resolver (handshake-volume-resolver)
    #[arg(long, env = "UPSTREAM_DNS", default_value = "127.0.0.1:5353")]
    pub upstream_dns: String,

    /// VPN subnet for device IP allocation
    #[arg(long, env = "VPN_SUBNET", default_value = "10.13.13.0/24")]
    pub vpn_subnet: String,

    /// WireGuard server public key
    #[arg(long, env = "WG_SERVER_PUBKEY")]
    pub wg_server_pubkey: Option<String>,

    /// WireGuard server endpoint (host:port)
    #[arg(long, env = "WG_SERVER_ENDPOINT")]
    pub wg_server_endpoint: Option<String>,

    /// PostgreSQL connection URL
    #[arg(long, env = "DATABASE_URL")]
    pub database_url: String,

    /// Tinybird API token
    #[arg(long, env = "TINYBIRD_TOKEN")]
    pub tinybird_token: String,

    /// Tinybird API endpoint
    #[arg(long, env = "TINYBIRD_ENDPOINT", default_value = "https://api.tinybird.co")]
    pub tinybird_endpoint: String,

    /// HMAC secret for domain hashing
    #[arg(long, env = "HMAC_SECRET")]
    pub hmac_secret: String,

    /// JWT secret for auth tokens
    #[arg(long, env = "JWT_SECRET")]
    pub jwt_secret: String,

    /// Auth domain for SIWE messages
    #[arg(long, env = "AUTH_DOMAIN", default_value = "hp-dns-gw.local")]
    pub auth_domain: String,

    /// Tinybird batch size (events per request)
    #[arg(long, env = "TINYBIRD_BATCH_SIZE", default_value = "1000")]
    pub tinybird_batch_size: usize,

    /// Tinybird flush interval in seconds
    #[arg(long, env = "TINYBIRD_FLUSH_INTERVAL", default_value = "5")]
    pub tinybird_flush_interval: u64,

    /// Heaven Names API base URL (e.g., https://api.heaven.xyz)
    /// When set, enables .heaven TLD resolution via the API
    #[arg(long, env = "HEAVEN_API_URL")]
    pub heaven_api_url: Option<String>,

    /// Bearer token for Heaven Names API /api/names/dns/resolve endpoint
    /// Must match DNS_SHARED_SECRET on the Worker
    #[arg(long, env = "HEAVEN_DNS_SECRET")]
    pub heaven_dns_secret: Option<String>,

    /// Gateway IP address for .heaven names (A record target)
    #[arg(long, env = "HEAVEN_GATEWAY_IP", default_value = "144.126.205.242")]
    pub heaven_gateway_ip: String,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        // Load .env file if present
        let _ = dotenvy::dotenv();

        Config::try_parse().context("Failed to parse configuration")
    }
}
