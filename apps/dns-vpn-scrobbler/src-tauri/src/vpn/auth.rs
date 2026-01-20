use super::types::VpnAuthResult;
use tauri::Emitter;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;

/// VPN Auth page URL - hosted site with Lit SDK for WireGuard device registration
#[cfg(debug_assertions)]
pub const VPN_AUTH_PAGE_URL: &str = "http://localhost:3000";
#[cfg(not(debug_assertions))]
pub const VPN_AUTH_PAGE_URL: &str = "https://heaven.computer";

/// Handle incoming auth callback from browser
pub async fn handle_vpn_auth_callback(listener: TcpListener, app: tauri::AppHandle) {
    loop {
        if let Ok((mut socket, _)) = listener.accept().await {
            let mut buffer = vec![0u8; 16384];

            if let Ok(n) = socket.read(&mut buffer).await {
                let request = String::from_utf8_lossy(&buffer[..n]);
                log::info!(
                    "VPN auth callback: {}",
                    request.lines().next().unwrap_or("")
                );

                // Handle CORS preflight
                if request.starts_with("OPTIONS") {
                    let response = build_cors_preflight();
                    let _ = socket.write_all(response.as_bytes()).await;
                    continue;
                }

                if let Some(result) = parse_vpn_callback(&request) {
                    let response = build_json_response(true);
                    let _ = socket.write_all(response.as_bytes()).await;

                    if result.error.is_some() {
                        let _ = app.emit("vpn-auth-error", result);
                    } else {
                        let _ = app.emit("vpn-auth-complete", result);
                    }
                    break;
                } else {
                    let response = build_json_response(false);
                    let _ = socket.write_all(response.as_bytes()).await;

                    let _ = app.emit(
                        "vpn-auth-error",
                        VpnAuthResult {
                            config: None,
                            wallet: None,
                            error: Some("Invalid callback".into()),
                        },
                    );
                    break;
                }
            }
        }
    }
}

/// Parse VPN auth callback (POST JSON or GET query params)
fn parse_vpn_callback(request: &str) -> Option<VpnAuthResult> {
    let first_line = request.lines().next()?;

    // Handle POST requests with JSON body
    if first_line.starts_with("POST /callback") {
        let body_start = request.find("\r\n\r\n").or_else(|| request.find("\n\n"))?;
        let body = &request[body_start..].trim();

        #[derive(serde::Deserialize)]
        struct CallbackBody {
            config: Option<String>,
            wallet: Option<String>,
            error: Option<String>,
        }

        let parsed: CallbackBody = serde_json::from_str(body).ok()?;
        return Some(VpnAuthResult {
            config: parsed.config,
            wallet: parsed.wallet,
            error: parsed.error,
        });
    }

    // Handle GET requests with query params (legacy/fallback)
    if !first_line.starts_with("GET /callback") {
        return None;
    }

    let path_end = first_line.find(" HTTP")?;
    let path = &first_line[4..path_end];
    let query_start = path.find('?')?;
    let query = &path[query_start + 1..];

    let mut config = None;
    let mut wallet = None;
    let mut error = None;

    for param in query.split('&') {
        let mut parts = param.splitn(2, '=');
        let key = parts.next()?;
        let value = urlencoding::decode(parts.next()?).ok()?;

        match key {
            "config" => config = Some(value.to_string()),
            "wallet" => wallet = Some(value.to_string()),
            "error" => error = Some(value.to_string()),
            _ => {}
        }
    }

    Some(VpnAuthResult {
        config,
        wallet,
        error,
    })
}

fn build_cors_preflight() -> String {
    "HTTP/1.1 204 No Content\r\n\
     Access-Control-Allow-Origin: *\r\n\
     Access-Control-Allow-Methods: POST, OPTIONS\r\n\
     Access-Control-Allow-Headers: Content-Type\r\n\
     Access-Control-Max-Age: 86400\r\n\
     Connection: close\r\n\r\n"
        .to_string()
}

fn build_json_response(success: bool) -> String {
    let body = if success {
        r#"{"ok":true}"#
    } else {
        r#"{"ok":false}"#
    };
    format!(
        "HTTP/1.1 200 OK\r\n\
         Content-Type: application/json\r\n\
         Access-Control-Allow-Origin: *\r\n\
         Connection: close\r\n\
         Content-Length: {}\r\n\r\n{}",
        body.len(),
        body
    )
}
