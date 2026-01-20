//! DNS UDP/TCP server

use super::handler::handle_query;
use crate::config::Config;
use crate::AppState;
use anyhow::{Context, Result};
use std::io::ErrorKind;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream, UdpSocket};
use tokio::sync::broadcast;
use tokio::time::{sleep, Duration};

pub async fn run(state: Arc<AppState>, mut shutdown: broadcast::Receiver<()>) -> Result<()> {
    let addr: SocketAddr = state.config.dns_listen.parse()
        .with_context(|| format!("Invalid DNS listen address: {}", state.config.dns_listen))?;

    let (udp, tcp) = bind_sockets(&state.config, addr).await?;

    tracing::info!("DNS server listening on {}", addr);

    let udp = Arc::new(udp);
    let mut buf = vec![0u8; 4096];

    loop {
        tokio::select! {
            _ = shutdown.recv() => {
                tracing::info!("DNS server shutting down");
                break;
            }
            // UDP
            result = udp.recv_from(&mut buf) => {
                if let Ok((n, src)) = result {
                    let pkt = buf[..n].to_vec();
                    let udp = udp.clone();
                    let state = state.clone();
                    tokio::spawn(async move {
                        if let Some(resp) = handle_query(&state, pkt, src.ip()).await {
                            let _ = udp.send_to(&resp, src).await;
                        }
                    });
                }
            }
            // TCP
            result = tcp.accept() => {
                if let Ok((stream, src)) = result {
                    let state = state.clone();
                    tokio::spawn(async move {
                        handle_tcp(state, stream, src).await;
                    });
                }
            }
        }
    }

    Ok(())
}

async fn bind_sockets(config: &Config, addr: SocketAddr) -> Result<(UdpSocket, TcpListener)> {
    let retry_delay = Duration::from_millis(config.dns_bind_retry_ms.max(1));
    let max_retries = config.dns_bind_retries;
    let mut attempt: u32 = 0;

    loop {
        match UdpSocket::bind(&addr).await {
            Ok(udp) => match TcpListener::bind(&addr).await {
                Ok(tcp) => return Ok((udp, tcp)),
                Err(err) => {
                    drop(udp);
                    if should_retry(&err, attempt, max_retries) {
                        attempt += 1;
                        log_retry(addr, "TCP", &err, attempt, max_retries, retry_delay);
                        sleep(retry_delay).await;
                        continue;
                    }
                    return Err(bind_error("TCP", addr, err));
                }
            },
            Err(err) => {
                if should_retry(&err, attempt, max_retries) {
                    attempt += 1;
                    log_retry(addr, "UDP", &err, attempt, max_retries, retry_delay);
                    sleep(retry_delay).await;
                    continue;
                }
                return Err(bind_error("UDP", addr, err));
            }
        }
    }
}

fn should_retry(err: &std::io::Error, attempt: u32, max_retries: u32) -> bool {
    if err.kind() != ErrorKind::AddrNotAvailable {
        return false;
    }
    max_retries == 0 || attempt < max_retries
}

fn log_retry(
    addr: SocketAddr,
    proto: &str,
    err: &std::io::Error,
    attempt: u32,
    max_retries: u32,
    retry_delay: Duration,
) {
    let retry_note = if max_retries == 0 {
        "infinite retries".to_string()
    } else {
        format!("{}/{}", attempt, max_retries)
    };
    tracing::warn!(
        "DNS {} bind failed on {}: {} ({}), retrying in {:?}",
        proto,
        addr,
        err,
        retry_note,
        retry_delay
    );
}

fn bind_error(proto: &str, addr: SocketAddr, err: std::io::Error) -> anyhow::Error {
    if err.kind() == ErrorKind::AddrInUse {
        return anyhow::anyhow!(
            "DNS {} bind failed on {}: address already in use (check for CoreDNS)",
            proto,
            addr
        );
    }
    anyhow::anyhow!("Failed to bind {} on {}: {}", proto, addr, err)
}

async fn handle_tcp(state: Arc<AppState>, mut stream: TcpStream, src: SocketAddr) {
    loop {
        // TCP DNS: 2-byte length prefix
        let mut len_buf = [0u8; 2];
        if stream.read_exact(&mut len_buf).await.is_err() {
            break;
        }

        let len = u16::from_be_bytes(len_buf) as usize;
        if len == 0 || len > 65535 {
            break;
        }

        let mut msg = vec![0u8; len];
        if stream.read_exact(&mut msg).await.is_err() {
            break;
        }

        let Some(resp) = handle_query(&state, msg, src.ip()).await else {
            break;
        };

        let out_len = (resp.len() as u16).to_be_bytes();
        if stream.write_all(&out_len).await.is_err() {
            break;
        }
        if stream.write_all(&resp).await.is_err() {
            break;
        }
    }
}
