//! .heaven TLD resolver
//!
//! Intercepts DNS queries for *.heaven and resolves them via the Heaven Names API.
//! Features:
//! - Positive/negative caching with TTLs from API response
//! - Request coalescing to prevent stampedes
//! - NXDOMAIN for unregistered/expired/reserved names
//! - SERVFAIL on API errors (fail closed, no cache poisoning)

use std::{
    net::Ipv4Addr,
    sync::Arc,
    time::{Duration, Instant},
};

use dashmap::DashMap;
use hickory_proto::{
    op::{Message, MessageType, OpCode, Query, ResponseCode},
    rr::{
        rdata::{A, SOA, TXT},
        Name, RData, Record, RecordType,
    },
    serialize::binary::BinEncodable,
};
use reqwest::Client;
use serde::Deserialize;
use tokio::sync::Mutex;

/// Resolver for .heaven TLD queries
#[derive(Clone)]
pub struct HeavenResolver {
    api_url: String,
    bearer: Option<String>,
    gateway_ip: Ipv4Addr,
    http: Client,

    /// label -> cached response
    cache: Arc<DashMap<String, CacheEntry>>,
    /// label -> in-flight mutex for request coalescing
    inflight: Arc<DashMap<String, Arc<Mutex<()>>>>,
}

#[derive(Clone)]
struct CacheEntry {
    expires_at: Instant,
    resolved: Resolved,
}

#[derive(Clone)]
struct Resolved {
    status: Status,
    a: Vec<Ipv4Addr>,
    txt: Vec<String>,
    ttl_positive: u32,
    ttl_negative: u32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Status {
    Active,
    Expired,
    Unregistered,
    Reserved,
}

/// API response from /api/names/dns/resolve
#[derive(Deserialize)]
struct ApiResponse {
    status: String,
    records: Option<ApiRecords>,
    ttl_positive: u32,
    ttl_negative: u32,
}

#[derive(Deserialize)]
#[allow(non_snake_case)]
struct ApiRecords {
    A: Vec<String>,
    TXT: Vec<String>,
    #[allow(dead_code)]
    AAAA: Vec<String>,
}

/// Classification of a query name relative to .heaven TLD
enum HeavenQName<'a> {
    /// Apex query: "heaven" or "heaven."
    Apex,
    /// Second-level domain: "foo.heaven"
    Sld(&'a str),
    /// Multi-level: "foo.bar.heaven" (not supported)
    Multi,
    /// Not a .heaven query
    NotHeaven,
}

impl HeavenResolver {
    /// Create a new HeavenResolver
    ///
    /// # Arguments
    /// * `api_url` - Base URL for the Heaven Names API (e.g., "https://api.heaven.xyz")
    /// * `bearer` - Optional bearer token for Authorization header
    /// * `gateway_ip` - IP address to return for active names (the gateway server)
    pub fn new(api_url: String, bearer: Option<String>, gateway_ip: Ipv4Addr) -> Self {
        Self {
            api_url: api_url.trim_end_matches('/').to_string(),
            bearer,
            gateway_ip,
            http: Client::new(),
            cache: Arc::new(DashMap::new()),
            inflight: Arc::new(DashMap::new()),
        }
    }

    /// Classify a normalized query name
    fn classify_qname<'a>(&self, qname_norm: &'a str) -> HeavenQName<'a> {
        // Handle apex
        if qname_norm == "heaven" || qname_norm == "heaven." {
            return HeavenQName::Apex;
        }

        let q = qname_norm.trim_end_matches('.');

        // Must end with .heaven
        if !q.ends_with(".heaven") {
            return HeavenQName::NotHeaven;
        }

        // Extract the part before .heaven
        let left = q.strip_suffix(".heaven").unwrap_or("");
        if left.is_empty() {
            return HeavenQName::Apex;
        }

        // Check if there are additional dots (multi-level not supported)
        if left.contains('.') {
            return HeavenQName::Multi;
        }

        HeavenQName::Sld(left)
    }

    /// Attempt to handle a DNS query for .heaven
    ///
    /// Returns `Some(response)` if this is a .heaven query, `None` otherwise.
    /// The caller should fall through to upstream resolution if None is returned.
    pub async fn maybe_handle(
        &self,
        request: &Message,
        qname_norm: &str,
        qtype: RecordType,
    ) -> Option<Vec<u8>> {
        match self.classify_qname(qname_norm) {
            HeavenQName::NotHeaven => None,
            HeavenQName::Multi => Some(build_nxdomain(request, 60)),
            HeavenQName::Apex => Some(build_apex(request, qtype, self.gateway_ip)),
            HeavenQName::Sld(label) => Some(self.handle_sld(request, label, qtype).await),
        }
    }

    /// Handle a second-level domain query (e.g., foo.heaven)
    async fn handle_sld(&self, request: &Message, label: &str, qtype: RecordType) -> Vec<u8> {
        let key = label.to_string();

        // Check cache first (fast path)
        if let Some(hit) = self.cache.get(label) {
            if Instant::now() < hit.expires_at {
                return build_from_resolved(request, label, qtype, &hit.resolved);
            } else {
                // Expired - remove stale entry
                drop(hit);
                self.cache.remove(label);
            }
        }

        // Get or create coalescing lock for this label
        let lock = self
            .inflight
            .entry(key.clone())
            .or_insert_with(|| Arc::new(Mutex::new(())))
            .clone();

        // Acquire lock (other concurrent requests for same label will wait here)
        let _guard = lock.lock().await;

        // Re-check cache after acquiring lock (another request may have populated it)
        // Note: Do NOT remove inflight here - let the leader (who populated cache) clean up.
        // Removing here would allow new arrivals to create a new mutex and cause stampede.
        if let Some(hit) = self.cache.get(label) {
            if Instant::now() < hit.expires_at {
                return build_from_resolved(request, label, qtype, &hit.resolved);
            }
        }

        // Fetch from API
        let result = match self.fetch(label).await {
            Ok(resolved) => {
                // Determine cache TTL based on status
                let ttl = match resolved.status {
                    Status::Active => resolved.ttl_positive,
                    Status::Expired | Status::Unregistered | Status::Reserved => {
                        resolved.ttl_negative
                    }
                };

                // Cache the result
                self.cache.insert(
                    key.clone(),
                    CacheEntry {
                        expires_at: Instant::now() + Duration::from_secs(ttl as u64),
                        resolved: resolved.clone(),
                    },
                );

                build_from_resolved(request, label, qtype, &resolved)
            }
            Err(e) => {
                tracing::warn!("Heaven API error for '{}': {}", label, e);
                // Fail closed: return SERVFAIL so clients retry
                // Do NOT cache errors to avoid poisoning
                build_servfail(request)
            }
        };

        // Clean up inflight entry to prevent memory leak
        self.inflight.remove(&key);

        result
    }

    /// Fetch name resolution from the Heaven Names API
    async fn fetch(&self, label: &str) -> Result<Resolved, reqwest::Error> {
        let url = format!(
            "{}/api/names/dns/resolve?label={}&tld=heaven",
            self.api_url,
            urlencoding::encode(label)
        );

        let mut req = self.http.get(&url);
        if let Some(b) = &self.bearer {
            req = req.header("Authorization", format!("Bearer {}", b));
        }

        let api: ApiResponse = req.send().await?.error_for_status()?.json().await?;

        let status = match api.status.as_str() {
            "active" => Status::Active,
            "expired" => Status::Expired,
            "reserved" => Status::Reserved,
            _ => Status::Unregistered,
        };

        let mut a = vec![];
        let mut txt = vec![];

        if let Some(r) = api.records {
            for ip in r.A {
                if let Ok(v4) = ip.parse::<Ipv4Addr>() {
                    a.push(v4);
                }
            }
            txt = r.TXT;
        }

        // Default A to gateway if active but API returned none
        if status == Status::Active && a.is_empty() {
            a.push(self.gateway_ip);
        }

        Ok(Resolved {
            status,
            a,
            txt,
            ttl_positive: api.ttl_positive,
            ttl_negative: api.ttl_negative,
        })
    }
}

/// Build response based on resolved status
fn build_from_resolved(request: &Message, label: &str, qtype: RecordType, r: &Resolved) -> Vec<u8> {
    match r.status {
        Status::Active => build_active(request, label, qtype, r),
        Status::Expired | Status::Unregistered | Status::Reserved => {
            build_nxdomain(request, r.ttl_negative)
        }
    }
}

/// Build response for an active name
fn build_active(request: &Message, label: &str, qtype: RecordType, r: &Resolved) -> Vec<u8> {
    let mut resp = base_response(request);

    let qname = Name::from_ascii(format!("{}.heaven.", label)).unwrap_or_else(|_| Name::root());
    let ttl = r.ttl_positive;

    // Add A records for A or ANY queries
    if matches!(qtype, RecordType::A | RecordType::ANY) {
        for ip in &r.a {
            let rec = Record::from_rdata(qname.clone(), ttl, RData::A(A(*ip)));
            resp.add_answer(rec);
        }
    }

    // Add TXT records for TXT or ANY queries
    if matches!(qtype, RecordType::TXT | RecordType::ANY) {
        for s in &r.txt {
            let rec = Record::from_rdata(qname.clone(), ttl, RData::TXT(TXT::new(vec![s.clone()])));
            resp.add_answer(rec);
        }
    }

    // For other types, return NOERROR with empty answer (NODATA)
    resp.set_response_code(ResponseCode::NoError);

    resp.to_bytes().unwrap_or_default()
}

/// Build response for apex query (heaven.)
fn build_apex(request: &Message, qtype: RecordType, gateway_ip: Ipv4Addr) -> Vec<u8> {
    let mut resp = base_response(request);
    let qname = Name::from_ascii("heaven.").unwrap_or_else(|_| Name::root());

    if matches!(qtype, RecordType::A | RecordType::ANY) {
        resp.add_answer(Record::from_rdata(qname, 3600, RData::A(A(gateway_ip))));
    }

    resp.set_response_code(ResponseCode::NoError);
    resp.to_bytes().unwrap_or_default()
}

/// Build NXDOMAIN response with SOA for proper negative caching
fn build_nxdomain(request: &Message, negative_ttl: u32) -> Vec<u8> {
    let mut resp = base_response(request);
    resp.set_response_code(ResponseCode::NXDomain);

    // Include SOA in authority section for proper negative caching
    if let Ok(name) = Name::from_ascii("heaven.") {
        let soa = SOA::new(
            Name::from_ascii("ns1.heaven.").unwrap_or_else(|_| Name::root()),
            Name::from_ascii("hostmaster.heaven.").unwrap_or_else(|_| Name::root()),
            1,          // serial
            3600,       // refresh
            600,        // retry
            604800,     // expire
            negative_ttl,
        );
        resp.add_name_server(Record::from_rdata(name, negative_ttl, RData::SOA(soa)));
    }

    resp.to_bytes().unwrap_or_default()
}

/// Build SERVFAIL response (used when API is unavailable)
fn build_servfail(request: &Message) -> Vec<u8> {
    let mut resp = base_response(request);
    resp.set_response_code(ResponseCode::ServFail);
    resp.to_bytes().unwrap_or_default()
}

/// Create base response message from request
fn base_response(request: &Message) -> Message {
    let mut resp = Message::new();
    resp.set_id(request.id());
    resp.set_message_type(MessageType::Response);
    resp.set_op_code(OpCode::Query);

    // For a recursive resolver doing synthetic override:
    // - AA=false (we're not the authoritative server, just intercepting)
    // - RA=true (we offer recursion)
    // - RD preserved from request
    resp.set_authoritative(false);
    resp.set_recursion_available(true);
    resp.set_recursion_desired(request.recursion_desired());

    // Preserve EDNS if present (for larger UDP size, DO bit, etc.)
    if let Some(edns) = request.edns() {
        resp.set_edns(edns.clone());
    }

    // Copy first query only (consistent with other response builders)
    if let Some(q) = request.queries().first() {
        resp.add_query(Query::query(q.name().clone(), q.query_type()));
    }

    resp
}
