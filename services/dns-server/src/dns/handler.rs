//! DNS query handler - categorize, log, forward

use crate::categorize::normalize_domain;
use crate::ingest::DnsEvent;
use crate::AppState;
use hickory_proto::op::{Message, MessageType, OpCode, Query, ResponseCode};
use hickory_proto::rr::rdata::{A, AAAA};
use hickory_proto::rr::{Name, RData, Record, RecordType};
use hickory_proto::serialize::binary::{BinDecodable, BinEncodable};
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};
use std::sync::Arc;
use std::time::Instant;

pub async fn handle_query(state: &Arc<AppState>, pkt: Vec<u8>, src_ip: IpAddr) -> Option<Vec<u8>> {
    let start = Instant::now();

    // Parse DNS message
    let msg = Message::from_bytes(&pkt).ok()?;
    let query = msg.queries().first()?;
    let qname = query.name().to_ascii();
    let qtype = query.query_type();

    // Normalize domain (lowercase, remove trailing dot)
    let qname_norm = normalize_qname(&qname);

    // Extract registrable domain (eTLD+1)
    let etld1 = normalize_domain(&qname_norm);

    // Lookup user by VPN IP
    let user = state.user_cache.get_by_ip(&src_ip).await;
    let (wallet_id, device_id) = match &user {
        Some(u) => {
            // Update last seen for this device
            state.last_seen.touch(u.device_id);
            (u.wallet_address.clone(), u.device_id)
        }
        None => {
            tracing::debug!("Unknown source IP: {}", src_ip);
            ("unknown".to_string(), uuid::Uuid::nil())
        }
    };

    // Categorize domain
    let category_id = state.category_map.lookup(&etld1);

    // Compute HMAC for privacy-preserving storage
    let domain_hmac = state.tinybird.hmac_domain(&etld1, &state.config.hmac_secret);

    // Check if domain is blocked for this user
    let is_blocked = if let Some(ref u) = user {
        state.rules_cache.is_blocked(&u.user_id, &etld1).await
    } else {
        false
    };

    // Check for .heaven TLD (before block check - always allow .heaven queries)
    if let Some(ref heaven) = state.heaven {
        if let Some(resp) = heaven.maybe_handle(&msg, &qname_norm, qtype).await {
            let latency_ms = start.elapsed().as_millis() as u32;

            // Queue event for Tinybird (mark as "heaven" action)
            // Use etld1 (registrable domain) for consistency with other events
            let event = DnsEvent {
                ts: chrono::Utc::now(),
                wallet_id: wallet_id.clone(),
                device_id,
                etld1: etld1.clone(),
                domain_hmac: state.tinybird.hmac_domain(&etld1, &state.config.hmac_secret),
                qtype: format!("{:?}", qtype),
                action: "heaven".to_string(),
                category_id: None,
                latency_ms,
            };
            state.tinybird.queue_event(event).await;

            tracing::debug!(
                "{} -> {} ({:?}) [heaven] {}ms",
                src_ip,
                etld1,
                qtype,
                latency_ms
            );

            return Some(resp);
        }
    }

    // Either block or forward to upstream
    let (response, action) = if is_blocked {
        // Return blocked response (0.0.0.0 / ::)
        let resp = build_blocked_response(&msg, &qname_norm, qtype)?;
        tracing::info!(
            src = %src_ip,
            domain = %etld1,
            "Blocked by user rule"
        );
        (resp, "block")
    } else {
        // Forward to upstream resolver
        match super::upstream::forward(&state.config.upstream_dns, &pkt).await {
            Ok(resp) => (resp, "allow"),
            Err(e) => {
                tracing::warn!("Upstream error for {}: {}", qname_norm, e);
                // Return SERVFAIL
                let resp = build_servfail(&msg)?;
                (resp, "error")
            }
        }
    };

    let latency_ms = start.elapsed().as_millis() as u32;

    // Queue event for Tinybird
    let event = DnsEvent {
        ts: chrono::Utc::now(),
        wallet_id,
        device_id,
        etld1: etld1.clone(),
        domain_hmac,
        qtype: format!("{:?}", qtype),
        action: action.to_string(),
        category_id,
        latency_ms,
    };
    state.tinybird.queue_event(event).await;

    tracing::debug!(
        "{} -> {} ({:?}) [{}] cat={:?} {}ms",
        src_ip,
        etld1,
        qtype,
        action,
        category_id,
        latency_ms
    );

    Some(response)
}

fn normalize_qname(s: &str) -> String {
    let mut out = s.trim().to_lowercase();
    if out.ends_with('.') {
        out.pop();
    }
    out
}

fn build_servfail(query: &Message) -> Option<Vec<u8>> {
    let mut resp = Message::new();
    resp.set_id(query.id());
    resp.set_message_type(MessageType::Response);
    resp.set_op_code(OpCode::Query);
    resp.set_recursion_desired(query.recursion_desired());
    resp.set_recursion_available(true);
    resp.set_response_code(ResponseCode::ServFail);

    if let Some(q) = query.queries().first() {
        resp.add_query(q.clone());
    }

    resp.to_bytes().ok()
}

/// Build blocked response (0.0.0.0 for A, :: for AAAA)
fn build_blocked_response(query: &Message, qname: &str, qtype: RecordType) -> Option<Vec<u8>> {
    let mut resp = Message::new();
    resp.set_id(query.id());
    resp.set_message_type(MessageType::Response);
    resp.set_op_code(OpCode::Query);
    resp.set_recursion_desired(query.recursion_desired());
    resp.set_recursion_available(true);

    let name = Name::from_ascii(format!("{}.", qname)).ok()?;
    resp.add_query(Query::query(name.clone(), qtype));

    const TTL: u32 = 60;

    match qtype {
        RecordType::A => {
            resp.add_answer(Record::from_rdata(
                name,
                TTL,
                RData::A(A(Ipv4Addr::UNSPECIFIED)),
            ));
            resp.set_response_code(ResponseCode::NoError);
        }
        RecordType::AAAA => {
            resp.add_answer(Record::from_rdata(
                name,
                TTL,
                RData::AAAA(AAAA(Ipv6Addr::UNSPECIFIED)),
            ));
            resp.set_response_code(ResponseCode::NoError);
        }
        _ => {
            resp.set_response_code(ResponseCode::NXDomain);
        }
    }

    resp.to_bytes().ok()
}
