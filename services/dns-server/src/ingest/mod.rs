//! Tinybird event ingestion

use chrono::{DateTime, Utc};
use hmac::{Hmac, Mac};
use serde::Serialize;
use sha2::Sha256;
use std::sync::Arc;
use tokio::sync::{broadcast, Mutex};
use tokio::time::{sleep, Duration};
use uuid::Uuid;

/// Max events in queue before dropping oldest
const MAX_QUEUE_SIZE: usize = 10_000;
/// Retry attempts before giving up on a batch
const MAX_RETRIES: u32 = 3;
/// Base delay between retries (doubles each attempt)
const RETRY_BASE_DELAY_MS: u64 = 500;

/// DNS event to send to Tinybird
#[derive(Debug, Clone, Serialize)]
pub struct DnsEvent {
    pub ts: DateTime<Utc>,
    pub wallet_id: String,
    pub device_id: Uuid,
    pub etld1: String,
    pub domain_hmac: String,
    pub qtype: String,
    pub action: String,
    pub category_id: Option<i32>,
    pub latency_ms: u32,
}

/// Tinybird client with batched event sending
pub struct TinybirdClient {
    token: String,
    endpoint: String,
    client: reqwest::Client,
    queue: Arc<Mutex<Vec<DnsEvent>>>,
}

impl TinybirdClient {
    pub fn new(token: &str, endpoint: &str) -> Self {
        Self {
            token: token.to_string(),
            endpoint: endpoint.to_string(),
            client: reqwest::Client::new(),
            queue: Arc::new(Mutex::new(Vec::with_capacity(1000))),
        }
    }

    /// Queue an event for batched sending (drops oldest if queue full)
    pub async fn queue_event(&self, event: DnsEvent) {
        let mut queue = self.queue.lock().await;
        if queue.len() >= MAX_QUEUE_SIZE {
            let dropped = queue.len() - MAX_QUEUE_SIZE + 1;
            queue.drain(0..dropped);
            tracing::warn!("Tinybird queue overflow, dropped {} oldest events", dropped);
        }
        queue.push(event);
    }

    /// Flush queued events to Tinybird with retry
    pub async fn flush(&self) -> anyhow::Result<usize> {
        let events = {
            let mut queue = self.queue.lock().await;
            if queue.is_empty() {
                return Ok(0);
            }
            std::mem::take(&mut *queue)
        };

        let original_count = events.len();

        // Convert to NDJSON, keeping track of successfully serialized events for potential requeue
        let mut serialization_errors = 0usize;
        let mut serializable_events: Vec<DnsEvent> = Vec::with_capacity(events.len());
        let mut serialized: Vec<String> = Vec::with_capacity(events.len());

        for event in events {
            match serde_json::to_string(&event) {
                Ok(s) => {
                    serialized.push(s);
                    serializable_events.push(event);
                }
                Err(_) => {
                    serialization_errors += 1;
                }
            }
        }

        let sent_count = serialized.len();

        if serialization_errors > 0 {
            tracing::warn!(
                "Dropped {} of {} events due to serialization errors",
                serialization_errors,
                original_count
            );
        }

        // Short-circuit if all events failed serialization
        if sent_count == 0 {
            return Ok(0);
        }

        let ndjson = serialized.join("\n");

        // Try to send with retries
        let url = format!("{}/v0/events?name=dns_events", self.endpoint);
        let mut last_error = None;

        for attempt in 0..MAX_RETRIES {
            match self.send_batch(&url, &ndjson).await {
                Ok(()) => {
                    tracing::debug!("Flushed {} events to Tinybird", sent_count);
                    return Ok(sent_count);
                }
                Err(e) => {
                    last_error = Some(e);
                    if attempt + 1 < MAX_RETRIES {
                        let delay = Duration::from_millis(RETRY_BASE_DELAY_MS * (1 << attempt));
                        tracing::warn!(
                            "Tinybird send failed (attempt {}/{}), retrying in {:?}",
                            attempt + 1,
                            MAX_RETRIES,
                            delay
                        );
                        sleep(delay).await;
                    }
                }
            }
        }

        // All retries failed - requeue only serializable events (respecting max size)
        {
            let mut queue = self.queue.lock().await;
            let space_available = MAX_QUEUE_SIZE.saturating_sub(queue.len());
            let to_requeue = serializable_events.len().min(space_available);

            if to_requeue > 0 {
                // Prepend failed events to front of queue
                let requeue_events = serializable_events.into_iter().take(to_requeue);
                let old_events = std::mem::take(&mut *queue);
                queue.extend(requeue_events);
                queue.extend(old_events);
                tracing::warn!(
                    "Requeued {} events after {} failed attempts ({} dropped due to overflow, {} dropped due to serialization)",
                    to_requeue,
                    MAX_RETRIES,
                    sent_count.saturating_sub(to_requeue),
                    serialization_errors
                );
            } else {
                tracing::error!(
                    "Dropped {} events after {} failed attempts (queue full, {} serialization errors)",
                    sent_count,
                    MAX_RETRIES,
                    serialization_errors
                );
            }
        }

        Err(last_error.unwrap_or_else(|| anyhow::anyhow!("Tinybird flush failed")))
    }

    async fn send_batch(&self, url: &str, ndjson: &str) -> anyhow::Result<()> {
        let resp = self
            .client
            .post(url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", "application/x-ndjson")
            .body(ndjson.to_string())
            .send()
            .await?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            anyhow::bail!("{} - {}", status, body.trim());
        }

        Ok(())
    }

    /// Compute HMAC of domain for privacy-preserving storage
    pub fn hmac_domain(&self, domain: &str, secret: &str) -> String {
        type HmacSha256 = Hmac<Sha256>;
        let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
            .expect("HMAC can take key of any size");
        mac.update(domain.as_bytes());
        let result = mac.finalize();
        hex::encode(result.into_bytes())
    }

    /// Get queue length
    pub async fn queue_len(&self) -> usize {
        self.queue.lock().await.len()
    }
}

/// Background task that periodically flushes events to Tinybird
pub async fn batch_sender(state: Arc<crate::AppState>, mut shutdown: broadcast::Receiver<()>) {
    let interval = tokio::time::Duration::from_secs(state.config.tinybird_flush_interval);
    let batch_size = state.config.tinybird_batch_size;

    let mut ticker = tokio::time::interval(interval);

    loop {
        tokio::select! {
            _ = shutdown.recv() => {
                // Final flush on shutdown
                if let Err(e) = state.tinybird.flush().await {
                    tracing::error!("Final Tinybird flush failed: {}", e);
                }
                tracing::info!("Tinybird batch sender stopped");
                break;
            }
            _ = ticker.tick() => {
                // Check if we have enough events or interval elapsed
                let queue_len = state.tinybird.queue_len().await;
                if queue_len > 0 {
                    match state.tinybird.flush().await {
                        Ok(n) => {
                            if n > 0 {
                                tracing::info!("Flushed {} events to Tinybird", n);
                            }
                        }
                        Err(e) => {
                            tracing::error!("Tinybird flush failed: {}", e);
                        }
                    }
                }
            }
        }

        // Also flush if queue exceeds batch size
        if state.tinybird.queue_len().await >= batch_size {
            if let Err(e) = state.tinybird.flush().await {
                tracing::error!("Tinybird batch flush failed: {}", e);
            }
        }
    }
}
