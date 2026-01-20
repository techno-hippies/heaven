#!/bin/bash
# DNS Server Health Check Suite
# Run from a machine with VPN access to 10.13.13.1 (or adjust DNS_SERVER)
#
# Usage: ./tests/health_check.sh [dns_server] [api_url]
# Example: ./tests/health_check.sh 10.13.13.1 https://heaven-api.deletion-backup782.workers.dev

set -euo pipefail

DNS_SERVER="${1:-10.13.13.1}"
API_URL="${2:-https://heaven-api.deletion-backup782.workers.dev}"
FAILED=0
PASSED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}!${NC} $1"
}

echo "=== Heaven DNS Health Check ==="
echo "DNS Server: $DNS_SERVER"
echo "API URL: $API_URL"
echo ""

# Check if dig is available
if ! command -v dig &> /dev/null; then
    echo "Error: 'dig' is required but not installed."
    echo "Install with: apt-get install dnsutils (Debian/Ubuntu) or brew install bind (macOS)"
    exit 1
fi

echo "--- API Connectivity ---"

# Test 1: API availability check
if curl -sf --max-time 5 "$API_URL/api/names/available/testname123" > /dev/null 2>&1; then
    pass "API is reachable"
else
    fail "API is not reachable at $API_URL"
fi

echo ""
echo "--- DNS Resolution Tests ---"

# Test 2: Apex query (heaven.)
APEX_RESULT=$(dig @"$DNS_SERVER" heaven A +short +time=2 2>/dev/null || echo "TIMEOUT")
if [[ "$APEX_RESULT" == "144.126.205.242" ]] || [[ "$APEX_RESULT" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    pass "Apex query (heaven.) returns A record: $APEX_RESULT"
else
    fail "Apex query (heaven.) failed: $APEX_RESULT"
fi

# Test 3: Unregistered name returns NXDOMAIN
UNREG_STATUS=$(dig @"$DNS_SERVER" nonexistent12345xyz.heaven A +time=2 2>/dev/null | grep -c "NXDOMAIN" || echo "0")
if [[ "$UNREG_STATUS" -ge 1 ]]; then
    pass "Unregistered name returns NXDOMAIN"
else
    fail "Unregistered name did not return NXDOMAIN"
fi

# Test 4: Reserved name returns NXDOMAIN (e.g., 'test', 'admin', 'www')
RESERVED_STATUS=$(dig @"$DNS_SERVER" admin.heaven A +time=2 2>/dev/null | grep -c "NXDOMAIN" || echo "0")
if [[ "$RESERVED_STATUS" -ge 1 ]]; then
    pass "Reserved name (admin.heaven) returns NXDOMAIN"
else
    fail "Reserved name did not return NXDOMAIN"
fi

# Test 5: Multi-level subdomain returns NXDOMAIN
MULTI_STATUS=$(dig @"$DNS_SERVER" sub.domain.heaven A +time=2 2>/dev/null | grep -c "NXDOMAIN" || echo "0")
if [[ "$MULTI_STATUS" -ge 1 ]]; then
    pass "Multi-level (sub.domain.heaven) returns NXDOMAIN"
else
    fail "Multi-level subdomain did not return NXDOMAIN"
fi

# Test 6: SOA record in NXDOMAIN response (for proper negative caching)
SOA_PRESENT=$(dig @"$DNS_SERVER" nonexistent12345xyz.heaven A +time=2 2>/dev/null | grep -c "SOA" || echo "0")
if [[ "$SOA_PRESENT" -ge 1 ]]; then
    pass "NXDOMAIN includes SOA record for negative caching"
else
    warn "NXDOMAIN missing SOA record (negative caching may not work)"
fi

# Test 7: Case insensitivity (DNS labels should be case-insensitive)
UPPER_RESULT=$(dig @"$DNS_SERVER" HEAVEN A +short +time=2 2>/dev/null || echo "TIMEOUT")
if [[ "$UPPER_RESULT" == "$APEX_RESULT" ]]; then
    pass "Case insensitivity works (HEAVEN == heaven)"
else
    fail "Case insensitivity failed"
fi

# Test 8: Regular domain forwarding (non-.heaven should go to upstream)
GOOGLE_RESULT=$(dig @"$DNS_SERVER" google.com A +short +time=5 2>/dev/null | head -1 || echo "TIMEOUT")
if [[ "$GOOGLE_RESULT" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    pass "Upstream forwarding works (google.com resolves)"
else
    warn "Upstream forwarding may not work (google.com): $GOOGLE_RESULT"
fi

echo ""
echo "--- HTTP API Health (on VPN) ---"

# Test 9: DNS server API health (if accessible)
API_HEALTH=$(curl -sf --max-time 5 "http://$DNS_SERVER:8080/auth/challenge" -X POST -H "Content-Type: application/json" -d '{"address":"0x1234"}' 2>/dev/null | grep -c "nonce" || echo "0")
if [[ "$API_HEALTH" -ge 1 ]]; then
    pass "DNS server API responding"
else
    warn "DNS server API not reachable (may need VPN)"
fi

echo ""
echo "=== Summary ==="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [[ $FAILED -gt 0 ]]; then
    exit 1
fi
exit 0
