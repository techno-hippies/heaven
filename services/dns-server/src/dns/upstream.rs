//! Forward DNS queries to upstream resolver

use anyhow::{Context, Result};
use std::time::Duration;
use tokio::net::UdpSocket;
use tokio::time::timeout;

const UPSTREAM_TIMEOUT: Duration = Duration::from_secs(5);

pub async fn forward(upstream: &str, query: &[u8]) -> Result<Vec<u8>> {
    // Use UDP for simplicity; add TCP fallback if needed
    let socket = UdpSocket::bind("0.0.0.0:0").await
        .context("Failed to bind UDP socket for upstream")?;

    socket.send_to(query, upstream).await
        .context("Failed to send to upstream")?;

    let mut buf = vec![0u8; 4096];
    let n = timeout(UPSTREAM_TIMEOUT, socket.recv(&mut buf)).await
        .context("Upstream timeout")?
        .context("Failed to receive from upstream")?;

    Ok(buf[..n].to_vec())
}
