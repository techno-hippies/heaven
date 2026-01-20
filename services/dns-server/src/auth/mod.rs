//! SIWE + JWT authentication

use dashmap::DashMap;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use siwe::{eip55, Message};
use std::sync::Arc;
use std::time::{Duration, Instant};
use time::{Duration as TimeDuration, OffsetDateTime};
use uuid::Uuid;

const NONCE_TTL_SECS: u64 = 300; // 5 minutes
const JWT_TTL_SECS: u64 = 86400 * 7; // 7 days
const SIWE_ISSUED_AT_MAX_AGE_SECS: i64 = 300; // 5 minutes
const SIWE_ISSUED_AT_FUTURE_SKEW_SECS: i64 = 60; // 1 minute
const ALLOWED_CHAIN_IDS: &[u64] = &[1];
const MOBILE_CODE_TTL_SECS: u64 = 60; // 1 minute - short lived for security

#[derive(Clone)]
pub struct AuthState {
    nonces: Arc<DashMap<String, NonceEntry>>,
    mobile_codes: Arc<DashMap<String, MobileCodeEntry>>,
    jwt_secret: Vec<u8>,
    domain: String,
}

struct NonceEntry {
    created_at: Instant,
}

/// Stored data for mobile handoff codes
#[derive(Clone)]
pub struct MobileCodeEntry {
    pub jwt: String,
    pub device_id: Uuid,
    pub wg_config: String,
    pub created_at: Instant,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,        // wallet address (checksummed)
    pub user_id: Uuid,      // database user ID
    pub exp: usize,         // expiration timestamp
    pub iat: usize,         // issued at timestamp
}

#[derive(Debug, thiserror::Error)]
pub enum AuthError {
    #[error("Invalid nonce")]
    InvalidNonce,
    #[error("Nonce expired")]
    NonceExpired,
    #[error("Invalid SIWE message: {0}")]
    InvalidMessage(String),
    #[error("Invalid signature: {0}")]
    InvalidSignature(String),
    #[error("Message domain does not match")]
    DomainMismatch,
    #[error("Message URI does not match")]
    UriMismatch,
    #[error("Message chain ID not allowed")]
    ChainIdMismatch,
    #[error("Issued At timestamp out of range")]
    IssuedAtOutOfRange,
    #[error("Address mismatch")]
    AddressMismatch,
    #[error("JWT error: {0}")]
    JwtError(#[from] jsonwebtoken::errors::Error),
}

impl AuthState {
    pub fn new(jwt_secret: &str, domain: &str) -> Self {
        Self {
            nonces: Arc::new(DashMap::new()),
            mobile_codes: Arc::new(DashMap::new()),
            jwt_secret: jwt_secret.as_bytes().to_vec(),
            domain: domain.to_string(),
        }
    }

    /// Generate a new nonce for authentication
    pub fn generate_nonce(&self) -> String {
        let nonce = Uuid::new_v4().to_string();
        self.nonces.insert(
            nonce.clone(),
            NonceEntry {
                created_at: Instant::now(),
            },
        );
        // Cleanup old nonces periodically
        self.cleanup_expired_nonces();
        nonce
    }

    /// Build the SIWE message that the client should sign
    pub fn build_message(&self, nonce: &str, address: &str) -> String {
        format!(
            "{domain} wants you to sign in with your Ethereum account:\n\
            {address}\n\n\
            Sign in to hp-dns-gw VPN service\n\n\
            URI: https://{domain}\n\
            Version: 1\n\
            Chain ID: 1\n\
            Nonce: {nonce}\n\
            Issued At: {issued_at}",
            domain = self.domain,
            address = address,
            nonce = nonce,
            issued_at = chrono::Utc::now().to_rfc3339(),
        )
    }

    /// Verify a signed SIWE message
    pub fn verify_signature(&self, message: &str, signature: &str) -> Result<String, AuthError> {
        // Parse SIWE message
        let parsed: Message = message
            .parse()
            .map_err(|e| AuthError::InvalidMessage(format!("{:?}", e)))?;

        if parsed.domain.to_string() != self.domain {
            return Err(AuthError::DomainMismatch);
        }

        let expected_uri = format!("https://{}", self.domain);
        if parsed.uri.to_string() != expected_uri {
            return Err(AuthError::UriMismatch);
        }

        if !ALLOWED_CHAIN_IDS.contains(&parsed.chain_id) {
            return Err(AuthError::ChainIdMismatch);
        }

        let now = OffsetDateTime::now_utc();
        let issued_at = *parsed.issued_at.as_ref();
        let max_age = TimeDuration::seconds(SIWE_ISSUED_AT_MAX_AGE_SECS);
        let max_future = TimeDuration::seconds(SIWE_ISSUED_AT_FUTURE_SKEW_SECS);
        if issued_at < now - max_age || issued_at > now + max_future {
            return Err(AuthError::IssuedAtOutOfRange);
        }

        // Check nonce exists and not expired
        let nonce = parsed.nonce.clone();
        let entry = self
            .nonces
            .remove(&nonce)
            .ok_or(AuthError::InvalidNonce)?;

        if entry.1.created_at.elapsed() > Duration::from_secs(NONCE_TTL_SECS) {
            return Err(AuthError::NonceExpired);
        }

        // Verify signature
        let sig_bytes = hex::decode(signature.trim_start_matches("0x"))
            .map_err(|e| AuthError::InvalidSignature(format!("Invalid hex: {}", e)))?;

        let sig_array: [u8; 65] = sig_bytes
            .try_into()
            .map_err(|_| AuthError::InvalidSignature("Signature must be 65 bytes".to_string()))?;

        parsed
            .verify_eip191(&sig_array)
            .map_err(|e| AuthError::InvalidSignature(format!("{:?}", e)))?;

        // Return checksummed address
        Ok(eip55(&parsed.address))
    }

    /// Issue a JWT token for an authenticated user
    pub fn issue_jwt(&self, wallet_address: &str, user_id: Uuid) -> Result<String, AuthError> {
        let now = chrono::Utc::now().timestamp() as usize;
        let claims = Claims {
            sub: wallet_address.to_string(),
            user_id,
            exp: now + JWT_TTL_SECS as usize,
            iat: now,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(&self.jwt_secret),
        )?;

        Ok(token)
    }

    /// Verify and decode a JWT token
    pub fn verify_jwt(&self, token: &str) -> Result<Claims, AuthError> {
        let mut validation = Validation::default();
        validation.validate_exp = true;

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(&self.jwt_secret),
            &validation,
        )?;

        Ok(token_data.claims)
    }

    fn cleanup_expired_nonces(&self) {
        let ttl = Duration::from_secs(NONCE_TTL_SECS);
        self.nonces.retain(|_, entry| entry.created_at.elapsed() < ttl);
    }

    /// Create a one-time mobile handoff code
    /// Returns (code, expires_in_secs)
    pub fn create_mobile_code(&self, jwt: String, device_id: Uuid, wg_config: String) -> (String, u64) {
        // Generate a cryptographically random code (32 bytes = 64 hex chars)
        let code = format!("{:032x}{:032x}", rand::random::<u128>(), rand::random::<u128>());

        self.mobile_codes.insert(code.clone(), MobileCodeEntry {
            jwt,
            device_id,
            wg_config,
            created_at: Instant::now(),
        });

        // Cleanup expired codes
        self.cleanup_expired_mobile_codes();

        (code, MOBILE_CODE_TTL_SECS)
    }

    /// Exchange a mobile code for the stored payload
    /// Returns None if code is invalid or expired
    pub fn exchange_mobile_code(&self, code: &str) -> Option<MobileCodeEntry> {
        let entry = self.mobile_codes.remove(code)?;

        // Check if expired
        if entry.1.created_at.elapsed() > Duration::from_secs(MOBILE_CODE_TTL_SECS) {
            return None;
        }

        Some(entry.1)
    }

    fn cleanup_expired_mobile_codes(&self) {
        let ttl = Duration::from_secs(MOBILE_CODE_TTL_SECS);
        self.mobile_codes.retain(|_, entry| entry.created_at.elapsed() < ttl);
    }
}
