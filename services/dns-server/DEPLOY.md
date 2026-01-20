# DNS Server Deployment Runbook

Deploy to a fresh Ubuntu 22.04+ droplet. Total time: ~15 min (plus ~2h for HSD sync).

## 1. Provision Droplet

```bash
# DigitalOcean: 2GB RAM minimum (HSD needs memory)
# Open ports: 22 (SSH), 51820/udp (WireGuard), 8080 (API)
```

## 2. Install Dependencies

```bash
ssh root@NEW_IP

# Docker
curl -fsSL https://get.docker.com | sh

# WireGuard tools (for key generation)
apt update && apt install -y wireguard-tools
```

## 3. Clone and Configure

```bash
cd /opt
git clone https://github.com/user/higher-power.git dns-vpn  # or rsync from local
cd dns-vpn

# Copy production compose
cp services/dns-server/docker-compose.production.yml docker-compose.yml

# Create hp-dns-gw build context (symlink to dns-server)
ln -s services/dns-server hp-dns-gw
```

## 4. Generate WireGuard Keys

```bash
mkdir -p wg-config/server
wg genkey | tee wg-config/server/privatekey-server | wg pubkey > wg-config/server/publickey-server
chmod 600 wg-config/server/privatekey-server

# Create initial wg0.conf
mkdir -p wg-config/wg_confs
cat > wg-config/wg_confs/wg0.conf << 'EOF'
[Interface]
Address = 10.13.13.1/24
ListenPort = 51820
PrivateKey = REPLACE_WITH_PRIVATE_KEY
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF

# Insert private key
sed -i "s|REPLACE_WITH_PRIVATE_KEY|$(cat wg-config/server/privatekey-server)|" wg-config/wg_confs/wg0.conf
```

## 5. Create .env

```bash
cat > .env << EOF
# Get public key from step 4
WG_SERVER_PUBKEY=$(cat wg-config/server/publickey-server)
SERVER_IP=NEW_IP_HERE

# Generate new secrets
JWT_SECRET=$(openssl rand -hex 32)
HMAC_SECRET=$(openssl rand -hex 32)

# Tinybird (reuse existing)
TINYBIRD_TOKEN=p.eyJ1IjogImMwMzM4YWE1LTg2NjEtNGE1Yi05YWU4LTU3ZjE3ZGRhZDRkZCIsICJpZCI6ICI5Y2I3NTIxYy1mNGY5LTQ0YWUtOTQ5ZS1kNDBjMWE4Mzg3NmUiLCAiaG9zdCI6ICJ1c19lYXN0In0.a6EguNP4LG3Ci2o309rKJChim5qIJAzX5f4P8rn_d6A
EOF
```

## 6. CoreDNS Config (Critical!)

CoreDNS in linuxserver/wireguard binds :53 by default. We need it on 5353:

```bash
mkdir -p wg-config/coredns
cat > wg-config/coredns/Corefile << 'EOF'
.:5353 {
    errors
    health
    ready
    forward . /etc/resolv.conf
    cache 30
    loop
    reload
    loadbalance
}
EOF
```

## 7. Deploy

```bash
docker compose build hp-dns-gw
docker compose up -d

# Wait for HSD to sync (~2 hours for full sync)
docker logs -f hp-hsd
```

## 8. Verify

```bash
# Check all containers running
docker ps

# Test DNS (after HSD syncs)
dig @10.13.13.1 google.com        # ICANN
dig @10.13.13.1 shakestation      # Handshake TLD

# Test API
curl http://localhost:8080/health
```

## 9. Restore Data (Optional)

If migrating from old server:

```bash
# Restore database
docker exec -i hp-postgres psql -U hp hp < db-backup.sql

# Restore WireGuard peers (from wg-config-backup/wg_confs/wg0.conf)
# Copy peer entries, restart wireguard container
```

---

## Gotchas We Learned The Hard Way

### HSD --no-sig0 (REQUIRED)
HSD adds SIG0 signatures by default. BIND in hp-resolver chokes on them:
```
root_proxy: error for shakestation: bad label type
```
Fix: `command: ["--ns-host=0.0.0.0", "--ns-port=5349", "--no-wallet", "--no-sig0"]`

### CoreDNS Port Conflict
linuxserver/wireguard runs CoreDNS on :53 by default. Our dns-server also needs :53.
Fix: Custom Corefile with `.:5353 { ... }` frees port 53 for dns-server.

### Network Namespace Sharing
dns-server uses `network_mode: "service:wireguard"` to share wg0 interface.
This means it sees VPN client IPs directly (10.13.13.x) instead of NAT'd IPs.

### VPN IP Allocation
Uses PostgreSQL advisory locks to prevent race conditions:
```sql
SELECT pg_advisory_xact_lock(1);
SELECT MAX(host(vpn_ip)::inet) FROM devices WHERE vpn_ip << '10.13.13.0/24';
```

### WireGuard Peer Provisioning
dns-server has NET_ADMIN cap and runs `wg set` + `ip route add` when devices register.
Also appends to wg0.conf for persistence across container restarts.

---

## Quick Commands

```bash
# SSH to server
ssh root@144.126.205.242

# Rebuild and restart dns-server
cd /opt/dns-vpn && docker compose build hp-dns-gw && docker compose up -d hp-dns-gw

# View logs
docker logs -f hp-dns-gw
docker logs -f hp-hsd

# Check WireGuard peers
docker exec hp-wireguard wg show

# Database shell
docker exec -it hp-postgres psql -U hp hp

# Sync code from local
rsync -avz --exclude 'target' --exclude 'wg-config' services/dns-server/ root@144.126.205.242:/opt/dns-vpn/hp-dns-gw/
```
