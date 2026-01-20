//! HTTP API for user management and WireGuard config

use crate::auth::Claims;
use crate::AppState;
use axum::{
    async_trait,
    extract::{ConnectInfo, FromRequestParts, Path, State},
    http::{request::Parts, StatusCode},
    routing::{get, post},
    Json, Router,
};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use serde::{Deserialize, Serialize};
use std::fs;
use std::net::Ipv4Addr;
use std::path::Path as FsPath;
use std::process::Command;
use std::sync::Arc;
use tokio::sync::broadcast;
use uuid::Uuid;

const WG_CONFIG_PATH: &str = "/config/wg_confs/wg0.conf";

pub async fn run(state: Arc<AppState>, mut shutdown: broadcast::Receiver<()>) -> anyhow::Result<()> {
    // CORS - allow browser requests from any origin (desktop VPN client auth flow)
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/whoami", get(whoami))
        .route("/auth/challenge", post(auth_challenge))
        .route("/auth/verify", post(auth_verify))
        .route("/auth/mobile-handoff", post(mobile_handoff))
        .route("/auth/mobile-exchange", post(mobile_exchange))
        .route("/devices", post(create_device))
        .route("/devices/:id/wg-config", get(get_wg_config))
        .route("/devices/:id/status", get(get_device_status))
        .route("/rules", get(get_rules))
        .route("/rules", post(set_rules))
        .route("/stats", get(get_stats))
        // Dev endpoint - single call to register and get config (no auth)
        .route("/dev/quick-connect", post(dev_quick_connect))
        .layer(cors)
        .with_state(state.clone());

    let addr: std::net::SocketAddr = state.config.api_listen.parse()?;
    tracing::info!("API server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;

    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>())
        .with_graceful_shutdown(async move {
            let _ = shutdown.recv().await;
        })
        .await?;

    Ok(())
}

// JWT Bearer token extractor
pub struct AuthUser(pub Claims);

#[async_trait]
impl FromRequestParts<Arc<AppState>> for AuthUser {
    type Rejection = (StatusCode, String);

    async fn from_request_parts(
        parts: &mut Parts,
        state: &Arc<AppState>,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .ok_or((StatusCode::UNAUTHORIZED, "Missing Authorization header".to_string()))?;

        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or((StatusCode::UNAUTHORIZED, "Invalid Authorization header format".to_string()))?;

        let claims = state
            .auth
            .verify_jwt(token)
            .map_err(|e| (StatusCode::UNAUTHORIZED, format!("Invalid token: {}", e)))?;

        Ok(AuthUser(claims))
    }
}

// Health check
async fn health() -> &'static str {
    "ok"
}

// VPN status check - tells client if they're connected via VPN
#[derive(Serialize)]
struct WhoamiResponse {
    vpn_connected: bool,
    client_ip: String,
}

async fn whoami(
    State(state): State<Arc<AppState>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> Json<WhoamiResponse> {
    let client_ip = addr.ip();

    // Check if client IP is in VPN subnet (e.g., 10.13.13.x)
    let vpn_connected = match client_ip {
        std::net::IpAddr::V4(ipv4) => {
            if let Ok(base) = parse_vpn_subnet(&state.config.vpn_subnet) {
                let octets = ipv4.octets();
                octets[0] == base[0] && octets[1] == base[1] && octets[2] == base[2]
            } else {
                false
            }
        }
        std::net::IpAddr::V6(_) => false,
    };

    tracing::debug!(
        client_ip = %client_ip,
        vpn_connected = vpn_connected,
        "Whoami request"
    );

    Json(WhoamiResponse {
        vpn_connected,
        client_ip: client_ip.to_string(),
    })
}

// Auth: challenge
#[derive(Serialize)]
struct ChallengeResponse {
    nonce: String,
    message: String,
}

#[derive(Deserialize)]
struct ChallengeRequest {
    address: String,
}

async fn auth_challenge(
    State(state): State<Arc<AppState>>,
    Json(req): Json<ChallengeRequest>,
) -> Json<ChallengeResponse> {
    let nonce = state.auth.generate_nonce();
    let message = state.auth.build_message(&nonce, &req.address);
    Json(ChallengeResponse { nonce, message })
}

// Auth: verify signature
#[derive(Deserialize)]
struct VerifyRequest {
    message: String,
    signature: String,
}

#[derive(Serialize)]
struct VerifyResponse {
    user_id: Uuid,
    token: String,
    wallet_address: String,
}

async fn auth_verify(
    State(state): State<Arc<AppState>>,
    Json(req): Json<VerifyRequest>,
) -> Result<Json<VerifyResponse>, (StatusCode, String)> {
    // Verify SIWE signature and extract wallet address
    let wallet_address = state
        .auth
        .verify_signature(&req.message, &req.signature)
        .map_err(|e| (StatusCode::UNAUTHORIZED, format!("Signature verification failed: {}", e)))?;

    // Create or get user
    let user_id = sqlx::query_scalar::<_, Uuid>(
        r#"
        INSERT INTO users (id, wallet_address)
        VALUES ($1, $2)
        ON CONFLICT (wallet_address) DO UPDATE SET wallet_address = $2
        RETURNING id
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(&wallet_address)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Issue JWT
    let token = state
        .auth
        .issue_jwt(&wallet_address, user_id)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to issue token: {}", e)))?;

    tracing::info!(wallet = %wallet_address, user_id = %user_id, "User authenticated");

    Ok(Json(VerifyResponse {
        user_id,
        token,
        wallet_address,
    }))
}

// Mobile handoff: create one-time code for secure deep link auth
// Called by website after device registration, returns code that mobile app exchanges
#[derive(Deserialize)]
struct MobileHandoffRequest {
    device_id: Uuid,
}

#[derive(Serialize)]
struct MobileHandoffResponse {
    code: String,
    expires_in: u64,
}

async fn mobile_handoff(
    State(state): State<Arc<AppState>>,
    AuthUser(claims): AuthUser,
    Json(req): Json<MobileHandoffRequest>,
) -> Result<Json<MobileHandoffResponse>, (StatusCode, String)> {
    let gateway_ip = vpn_gateway_ip(&state.config.vpn_subnet)?;

    // Verify device belongs to user
    let device = sqlx::query_as::<_, (String, Uuid)>(
        "SELECT host(vpn_ip), user_id FROM devices WHERE id = $1",
    )
    .bind(req.device_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "Device not found".to_string()))?;

    let (vpn_ip, owner_id) = device;

    if owner_id != claims.user_id {
        return Err((StatusCode::FORBIDDEN, "Device belongs to another user".to_string()));
    }

    // Build WireGuard config (same as get_wg_config)
    let server_pubkey = state
        .config
        .wg_server_pubkey
        .as_deref()
        .unwrap_or("SERVER_PUBKEY_NOT_CONFIGURED");
    let server_endpoint = state
        .config
        .wg_server_endpoint
        .as_deref()
        .unwrap_or("SERVER_ENDPOINT_NOT_CONFIGURED");

    // Linux config - with PostUp/PreDown for systemd-resolved
    // DNS must be set on VPN interface (%i), not default interface
    let wg_config = format!(
        r#"[Interface]
PrivateKey = YOUR_PRIVATE_KEY
Address = {}/32
PostUp = /usr/bin/mkdir -p /etc/systemd/resolved.conf.d && /usr/bin/printf '[Resolve]\nResolveUnicastSingleLabel=yes\n' > /etc/systemd/resolved.conf.d/hp-single-label.conf && /usr/bin/systemctl restart systemd-resolved; /usr/bin/resolvectl dns %i {}; /usr/bin/resolvectl domain %i "~."; /usr/bin/resolvectl flush-caches
PreDown = /usr/bin/rm -f /etc/systemd/resolved.conf.d/hp-single-label.conf; /usr/bin/resolvectl revert %i || true; /usr/bin/systemctl restart systemd-resolved || true

[Peer]
PublicKey = {}
AllowedIPs = {}/32
Endpoint = {}
PersistentKeepalive = 25"#,
        vpn_ip, gateway_ip, server_pubkey, gateway_ip, server_endpoint
    );

    // Issue a fresh JWT for the mobile app (so website JWT isn't passed around)
    let mobile_jwt = state
        .auth
        .issue_jwt(&claims.sub, claims.user_id)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("JWT error: {}", e)))?;

    // Create one-time code
    let (code, expires_in) = state.auth.create_mobile_code(mobile_jwt, req.device_id, wg_config);

    tracing::info!(
        device_id = %req.device_id,
        user_id = %claims.user_id,
        "Mobile handoff code created"
    );

    Ok(Json(MobileHandoffResponse { code, expires_in }))
}

// Mobile exchange: trade one-time code for JWT + config
// Called by mobile app after receiving code via deep link
#[derive(Deserialize)]
struct MobileExchangeRequest {
    code: String,
}

#[derive(Serialize)]
struct MobileExchangeResponse {
    jwt: String,
    device_id: Uuid,
    wg_config: String,
}

async fn mobile_exchange(
    State(state): State<Arc<AppState>>,
    Json(req): Json<MobileExchangeRequest>,
) -> Result<Json<MobileExchangeResponse>, (StatusCode, String)> {
    let entry = state
        .auth
        .exchange_mobile_code(&req.code)
        .ok_or((StatusCode::UNAUTHORIZED, "Invalid or expired code".to_string()))?;

    tracing::info!(device_id = %entry.device_id, "Mobile code exchanged");

    Ok(Json(MobileExchangeResponse {
        jwt: entry.jwt,
        device_id: entry.device_id,
        wg_config: entry.wg_config,
    }))
}

// Create device (requires JWT)
#[derive(Deserialize)]
struct CreateDeviceRequest {
    device_name: String,
    wg_pubkey: String,
}

#[derive(Serialize)]
struct CreateDeviceResponse {
    device_id: Uuid,
    vpn_ip: String,
    wg_provisioned: bool,
}

async fn create_device(
    State(state): State<Arc<AppState>>,
    AuthUser(claims): AuthUser,
    Json(req): Json<CreateDeviceRequest>,
) -> Result<Json<CreateDeviceResponse>, (StatusCode, String)> {
    let subnet_base = parse_vpn_subnet(&state.config.vpn_subnet)?;

    let mut tx = state
        .db
        .begin()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    sqlx::query("SELECT pg_advisory_xact_lock($1)")
        .bind(42_i64)
        .execute(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Allocate next VPN IP (use host() to strip CIDR mask before parsing octet)
    let max_host = sqlx::query_scalar::<_, Option<i32>>(
        "SELECT MAX(SPLIT_PART(host(vpn_ip), '.', 4)::int) FROM devices WHERE vpn_ip << $1::inet",
    )
    .bind(&state.config.vpn_subnet)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let next_host = max_host.unwrap_or(1) + 1;
    if next_host > 254 {
        return Err((StatusCode::CONFLICT, "VPN subnet exhausted".to_string()));
    }

    let vpn_ip = format!(
        "{}.{}.{}.{}",
        subnet_base[0], subnet_base[1], subnet_base[2], next_host
    );
    let device_id = Uuid::new_v4();

    sqlx::query(
        r#"
        INSERT INTO devices (id, user_id, device_name, wg_pubkey, vpn_ip)
        VALUES ($1, $2, $3, $4, $5::inet)
        "#,
    )
    .bind(device_id)
    .bind(claims.user_id)
    .bind(&req.device_name)
    .bind(&req.wg_pubkey)
    .bind(&vpn_ip)
    .execute(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Add peer to WireGuard
    if let Err(e) = add_wireguard_peer(&req.wg_pubkey, &vpn_ip) {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("WireGuard provisioning failed: {}", e),
        ));
    }

    if let Err(e) = tx.commit().await {
        remove_wireguard_peer(&req.wg_pubkey);
        if let Err(cleanup_err) = remove_peer_from_config(&req.wg_pubkey) {
            tracing::warn!(
                pubkey = %req.wg_pubkey,
                error = %cleanup_err,
                "Failed to remove WireGuard peer from config after DB error"
            );
        }
        return Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string()));
    }

    // Update cache
    state.user_cache.upsert(crate::users::CachedUser {
        user_id: claims.user_id,
        wallet_address: claims.sub.clone(),
        device_id,
        vpn_ip: vpn_ip.parse().unwrap(),
    });

    let wg_provisioned = true;

    tracing::info!(
        device_id = %device_id,
        user_id = %claims.user_id,
        wallet = %claims.sub,
        vpn_ip = %vpn_ip,
        wg_provisioned = wg_provisioned,
        "Device created"
    );

    Ok(Json(CreateDeviceResponse {
        device_id,
        vpn_ip,
        wg_provisioned,
    }))
}

/// Add a peer to the WireGuard interface
fn add_wireguard_peer(pubkey: &str, vpn_ip: &str) -> Result<(), String> {
    // We share network namespace with wireguard container, so wg0 is accessible
    // Run `wg set wg0 peer <pubkey> allowed-ips <ip>/32`
    let result = Command::new("wg")
        .args(["set", "wg0", "peer", pubkey, "allowed-ips", &format!("{}/32", vpn_ip)])
        .output();

    match result {
        Ok(output) if output.status.success() => {
            tracing::info!(pubkey = %pubkey, vpn_ip = %vpn_ip, "WireGuard peer added");

            // Also add the route so responses can reach the peer
            let route_result = Command::new("ip")
                .args(["route", "add", vpn_ip, "dev", "wg0"])
                .output();

            match route_result {
                Ok(route_output) if route_output.status.success() => {
                    tracing::info!(vpn_ip = %vpn_ip, "Route added for peer");
                }
                Ok(route_output) => {
                    let stderr = String::from_utf8_lossy(&route_output.stderr);
                    // Route may already exist, which is fine
                    if !stderr.contains("File exists") {
                        tracing::warn!(vpn_ip = %vpn_ip, stderr = %stderr, "Failed to add route (non-fatal)");
                    }
                }
                Err(e) => {
                    tracing::warn!(vpn_ip = %vpn_ip, error = %e, "Failed to execute ip route command (non-fatal)");
                }
            }

            if let Err(e) = persist_wireguard_peer(pubkey, vpn_ip) {
                remove_wireguard_peer(pubkey);
                return Err(e);
            }
            Ok(())
        }
        Ok(output) => {
            let stderr = String::from_utf8_lossy(&output.stderr);
            tracing::error!(pubkey = %pubkey, stderr = %stderr, "Failed to add WireGuard peer");
            Err(format!("wg set failed: {}", stderr))
        }
        Err(e) => {
            tracing::error!(pubkey = %pubkey, error = %e, "Failed to execute wg command");
            Err(format!("wg set failed: {}", e))
        }
    }
}

fn persist_wireguard_peer(pubkey: &str, vpn_ip: &str) -> Result<(), String> {
    let path = FsPath::new(WG_CONFIG_PATH);
    let contents = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read {}: {}", path.display(), e))?;

    let public_key_line = format!("PublicKey = {}", pubkey);
    if contents.lines().any(|line| line.trim() == public_key_line) {
        return Ok(());
    }

    let mut updated = contents;
    if !updated.ends_with('\n') {
        updated.push('\n');
    }
    updated.push_str("\n[Peer]\n");
    updated.push_str(&format!("PublicKey = {}\n", pubkey));
    updated.push_str(&format!("AllowedIPs = {}/32\n", vpn_ip));

    let tmp_path = path.with_extension("conf.tmp");
    fs::write(&tmp_path, updated)
        .map_err(|e| format!("Failed to write {}: {}", tmp_path.display(), e))?;
    fs::rename(&tmp_path, path)
        .map_err(|e| format!("Failed to replace {}: {}", path.display(), e))?;

    Ok(())
}

fn remove_wireguard_peer(pubkey: &str) {
    let result = Command::new("wg")
        .args(["set", "wg0", "peer", pubkey, "remove"])
        .output();

    match result {
        Ok(output) if output.status.success() => {
            tracing::info!(pubkey = %pubkey, "WireGuard peer removed");
        }
        Ok(output) => {
            tracing::warn!(
                pubkey = %pubkey,
                stderr = %String::from_utf8_lossy(&output.stderr),
                "Failed to remove WireGuard peer"
            );
        }
        Err(e) => {
            tracing::warn!(pubkey = %pubkey, error = %e, "Failed to execute wg remove");
        }
    }
}

fn remove_peer_from_config(pubkey: &str) -> Result<(), String> {
    let path = FsPath::new(WG_CONFIG_PATH);
    let contents = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read {}: {}", path.display(), e))?;

    let mut output: Vec<String> = Vec::new();
    let mut current_block: Vec<String> = Vec::new();
    let mut in_peer = false;
    let mut current_pubkey: Option<String> = None;

    for line in contents.lines() {
        if line.trim() == "[Peer]" {
            if in_peer {
                if current_pubkey.as_deref() != Some(pubkey) {
                    output.extend(current_block.drain(..));
                } else {
                    current_block.clear();
                }
                current_pubkey = None;
            }
            in_peer = true;
            current_block.push(line.to_string());
            continue;
        }

        if in_peer {
            if let Some(rest) = line.trim().strip_prefix("PublicKey = ") {
                current_pubkey = Some(rest.trim().to_string());
            }
            current_block.push(line.to_string());
        } else {
            output.push(line.to_string());
        }
    }

    if in_peer {
        if current_pubkey.as_deref() != Some(pubkey) {
            output.extend(current_block);
        }
    }

    let mut updated = output.join("\n");
    if !updated.ends_with('\n') {
        updated.push('\n');
    }

    let tmp_path = path.with_extension("conf.tmp");
    fs::write(&tmp_path, updated)
        .map_err(|e| format!("Failed to write {}: {}", tmp_path.display(), e))?;
    fs::rename(&tmp_path, path)
        .map_err(|e| format!("Failed to replace {}: {}", path.display(), e))?;

    Ok(())
}

// Get WireGuard config for device (requires JWT, must own device)
#[derive(Serialize)]
struct WgConfigResponse {
    config: String,
}

async fn get_wg_config(
    State(state): State<Arc<AppState>>,
    AuthUser(claims): AuthUser,
    Path(device_id): Path<Uuid>,
) -> Result<Json<WgConfigResponse>, (StatusCode, String)> {
    let gateway_ip = vpn_gateway_ip(&state.config.vpn_subnet)?;

    // Verify device belongs to user (use host() to get IP without CIDR mask)
    let device = sqlx::query_as::<_, (String, Uuid)>(
        "SELECT host(vpn_ip), user_id FROM devices WHERE id = $1",
    )
    .bind(device_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "Device not found".to_string()))?;

    let (vpn_ip, owner_id) = device;

    if owner_id != claims.user_id {
        return Err((StatusCode::FORBIDDEN, "Device belongs to another user".to_string()));
    }

    let server_pubkey = state
        .config
        .wg_server_pubkey
        .as_deref()
        .unwrap_or("SERVER_PUBKEY_NOT_CONFIGURED");
    let server_endpoint = state
        .config
        .wg_server_endpoint
        .as_deref()
        .unwrap_or("SERVER_ENDPOINT_NOT_CONFIGURED");

    // Linux config - with PostUp/PreDown for systemd-resolved
    // DNS must be set on VPN interface (%i), not default interface
    // Also enables single-label DNS resolution for Handshake TLDs
    let config = format!(
        r#"[Interface]
PrivateKey = YOUR_PRIVATE_KEY
Address = {}/32
PostUp = /usr/bin/mkdir -p /etc/systemd/resolved.conf.d && /usr/bin/printf '[Resolve]\nResolveUnicastSingleLabel=yes\n' > /etc/systemd/resolved.conf.d/hp-single-label.conf && /usr/bin/systemctl restart systemd-resolved; /usr/bin/resolvectl dns %i {}; /usr/bin/resolvectl domain %i "~."; /usr/bin/resolvectl flush-caches
PreDown = /usr/bin/rm -f /etc/systemd/resolved.conf.d/hp-single-label.conf; /usr/bin/resolvectl revert %i || true; /usr/bin/systemctl restart systemd-resolved || true

[Peer]
PublicKey = {}
AllowedIPs = {}/32
Endpoint = {}
PersistentKeepalive = 25"#,
        vpn_ip, gateway_ip, server_pubkey, gateway_ip, server_endpoint
    );

    Ok(Json(WgConfigResponse { config }))
}

// Get device connection status (requires JWT, must own device)
#[derive(Serialize)]
struct DeviceStatusResponse {
    device_id: Uuid,
    vpn_ip: String,
    last_dns_at: Option<String>,
    connected: bool,
}

async fn get_device_status(
    State(state): State<Arc<AppState>>,
    AuthUser(claims): AuthUser,
    Path(device_id): Path<Uuid>,
) -> Result<Json<DeviceStatusResponse>, (StatusCode, String)> {
    // Verify device belongs to user
    let device = sqlx::query_as::<_, (String, Uuid)>(
        "SELECT host(vpn_ip), user_id FROM devices WHERE id = $1",
    )
    .bind(device_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "Device not found".to_string()))?;

    let (vpn_ip, owner_id) = device;

    if owner_id != claims.user_id {
        return Err((StatusCode::FORBIDDEN, "Device belongs to another user".to_string()));
    }

    // Check last seen (within 5 minutes = connected)
    let last_dns_at = state.last_seen.get(&device_id);
    let connected = state.last_seen.is_connected(&device_id, 5);

    Ok(Json(DeviceStatusResponse {
        device_id,
        vpn_ip,
        last_dns_at: last_dns_at.map(|t| t.to_rfc3339()),
        connected,
    }))
}

// Stats endpoint
#[derive(Serialize)]
struct StatsResponse {
    queue_length: usize,
    cached_users: usize,
}

async fn get_stats(State(state): State<Arc<AppState>>) -> Json<StatsResponse> {
    Json(StatsResponse {
        queue_length: state.tinybird.queue_len().await,
        cached_users: state.user_cache.len(),
    })
}

// Get blocked domains (requires JWT)
#[derive(Serialize)]
struct RulesResponse {
    domains: Vec<String>,
}

async fn get_rules(
    State(state): State<Arc<AppState>>,
    AuthUser(claims): AuthUser,
) -> Json<RulesResponse> {
    let domains = state.rules_cache.get_blocked_domains(&claims.user_id).await;
    Json(RulesResponse { domains })
}

// Set blocked domains (requires JWT)
#[derive(Deserialize)]
struct SetRulesRequest {
    domains: Vec<String>,
}

async fn set_rules(
    State(state): State<Arc<AppState>>,
    AuthUser(claims): AuthUser,
    Json(req): Json<SetRulesRequest>,
) -> Result<Json<RulesResponse>, (StatusCode, String)> {
    // Normalize domains (lowercase, trim)
    let domains: Vec<String> = req
        .domains
        .iter()
        .map(|d| d.trim().to_lowercase())
        .filter(|d| !d.is_empty())
        .collect();

    // Update database (delete all, then insert)
    let mut tx = state
        .db
        .begin()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    sqlx::query("DELETE FROM user_rules WHERE user_id = $1")
        .bind(claims.user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    for domain in &domains {
        sqlx::query("INSERT INTO user_rules (user_id, domain) VALUES ($1, $2) ON CONFLICT (user_id, domain) DO NOTHING")
            .bind(claims.user_id)
            .bind(domain)
            .execute(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    tx.commit()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Update cache
    state.rules_cache.set_blocked_domains(claims.user_id, domains.clone()).await;

    tracing::info!(
        user_id = %claims.user_id,
        wallet = %claims.sub,
        count = domains.len(),
        "Rules updated"
    );

    Ok(Json(RulesResponse { domains }))
}

fn parse_vpn_subnet(subnet: &str) -> Result<[u8; 3], (StatusCode, String)> {
    let (network_str, prefix_str) = subnet.split_once('/').ok_or_else(|| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Invalid VPN_SUBNET: {}", subnet),
        )
    })?;
    let prefix: u8 = prefix_str.parse().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Invalid VPN_SUBNET: {}", subnet),
        )
    })?;

    if prefix != 24 {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("VPN_SUBNET must be /24: {}", subnet),
        ));
    }

    let network: Ipv4Addr = network_str.parse().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Invalid VPN_SUBNET: {}", subnet),
        )
    })?;
    let octets = network.octets();
    if octets[3] != 0 {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("VPN_SUBNET must be a /24 network address: {}", subnet),
        ));
    }

    Ok([octets[0], octets[1], octets[2]])
}

fn vpn_gateway_ip(subnet: &str) -> Result<String, (StatusCode, String)> {
    let base = parse_vpn_subnet(subnet)?;
    Ok(format!("{}.{}.{}.1", base[0], base[1], base[2]))
}

// ============================================================================
// DEV ENDPOINT - Quick connect without auth (for testing)
// ============================================================================

#[derive(Deserialize)]
struct DevQuickConnectRequest {
    wg_pubkey: String,
    device_name: Option<String>,
}

#[derive(Serialize)]
struct DevQuickConnectResponse {
    vpn_ip: String,
    wg_config: String,
}

/// Dev-only endpoint: register device and get WireGuard config in one call.
/// No authentication required - for testing only!
async fn dev_quick_connect(
    State(state): State<Arc<AppState>>,
    Json(req): Json<DevQuickConnectRequest>,
) -> Result<Json<DevQuickConnectResponse>, (StatusCode, String)> {
    tracing::warn!(pubkey = %req.wg_pubkey, "DEV quick-connect (no auth)");

    // Check if this pubkey is already registered
    let existing: Option<String> = sqlx::query_scalar(
        "SELECT host(vpn_ip) FROM devices WHERE wg_pubkey = $1"
    )
    .bind(&req.wg_pubkey)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let vpn_ip = if let Some(ip) = existing {
        tracing::info!(pubkey = %req.wg_pubkey, vpn_ip = %ip, "Device already registered");
        ip
    } else {
        // Allocate new IP
        let subnet_base = parse_vpn_subnet(&state.config.vpn_subnet)?;

        let mut tx = state
            .db
            .begin()
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        sqlx::query("SELECT pg_advisory_xact_lock($1)")
            .bind(42_i64)
            .execute(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        let max_host = sqlx::query_scalar::<_, Option<i32>>(
            "SELECT MAX(SPLIT_PART(host(vpn_ip), '.', 4)::int) FROM devices WHERE vpn_ip << $1::inet",
        )
        .bind(&state.config.vpn_subnet)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        let next_host = max_host.unwrap_or(1) + 1;
        if next_host > 254 {
            return Err((StatusCode::CONFLICT, "VPN subnet exhausted".to_string()));
        }

        let vpn_ip = format!(
            "{}.{}.{}.{}",
            subnet_base[0], subnet_base[1], subnet_base[2], next_host
        );

        // Create a dev user if needed (or use existing dev user)
        let dev_user_id: Uuid = sqlx::query_scalar(
            "INSERT INTO users (id, wallet_address) VALUES ($1, $2)
             ON CONFLICT (wallet_address) DO UPDATE SET wallet_address = EXCLUDED.wallet_address
             RETURNING id"
        )
        .bind(Uuid::new_v4())
        .bind("dev-test-user")
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        let device_id = Uuid::new_v4();
        let device_name = req.device_name.as_deref().unwrap_or("dev-device");

        sqlx::query(
            r#"
            INSERT INTO devices (id, user_id, device_name, wg_pubkey, vpn_ip)
            VALUES ($1, $2, $3, $4, $5::inet)
            "#,
        )
        .bind(device_id)
        .bind(dev_user_id)
        .bind(device_name)
        .bind(&req.wg_pubkey)
        .bind(&vpn_ip)
        .execute(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        // Add peer to WireGuard
        if let Err(e) = add_wireguard_peer(&req.wg_pubkey, &vpn_ip) {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("WireGuard provisioning failed: {}", e),
            ));
        }

        tx.commit()
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        tracing::info!(
            device_id = %device_id,
            vpn_ip = %vpn_ip,
            "DEV device created"
        );

        vpn_ip
    };

    // Build WireGuard config
    let gateway_ip = vpn_gateway_ip(&state.config.vpn_subnet)?;
    let server_pubkey = state
        .config
        .wg_server_pubkey
        .as_deref()
        .unwrap_or("SERVER_PUBKEY_NOT_CONFIGURED");
    let server_endpoint = state
        .config
        .wg_server_endpoint
        .as_deref()
        .unwrap_or("SERVER_ENDPOINT_NOT_CONFIGURED");

    // Detect Android by device_name containing "android" (case insensitive)
    let is_android = req.device_name
        .as_ref()
        .map(|n| n.to_lowercase().contains("android"))
        .unwrap_or(false);

    let wg_config = if is_android {
        // Android config - simple DNS= line, no scripts
        format!(
            r#"[Interface]
PrivateKey = YOUR_PRIVATE_KEY
Address = {}/32
DNS = {}

[Peer]
PublicKey = {}
AllowedIPs = {}/32
Endpoint = {}
PersistentKeepalive = 25"#,
            vpn_ip, gateway_ip, server_pubkey, gateway_ip, server_endpoint
        )
    } else {
        // Linux config - with PostUp/PreDown for systemd-resolved
        // DNS must be set on VPN interface (not default) so systemd-resolved routes queries correctly
        // Also enables single-label DNS resolution for Handshake TLDs
        format!(
            r#"[Interface]
PrivateKey = YOUR_PRIVATE_KEY
Address = {}/32
PostUp = /usr/bin/mkdir -p /etc/systemd/resolved.conf.d && /usr/bin/printf '[Resolve]\nResolveUnicastSingleLabel=yes\n' > /etc/systemd/resolved.conf.d/hp-single-label.conf && /usr/bin/systemctl restart systemd-resolved; /usr/bin/resolvectl dns %i {}; /usr/bin/resolvectl domain %i "~."; /usr/bin/resolvectl flush-caches
PreDown = /usr/bin/rm -f /etc/systemd/resolved.conf.d/hp-single-label.conf; /usr/bin/resolvectl revert %i || true; /usr/bin/systemctl restart systemd-resolved || true

[Peer]
PublicKey = {}
AllowedIPs = {}/32
Endpoint = {}
PersistentKeepalive = 25"#,
            vpn_ip, gateway_ip, server_pubkey, gateway_ip, server_endpoint
        )
    };

    Ok(Json(DevQuickConnectResponse { vpn_ip, wg_config }))
}
