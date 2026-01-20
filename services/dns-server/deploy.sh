#!/bin/bash
set -e

# HP DNS Server Deploy Script
# Run on fresh Ubuntu 22.04+ droplet
# Usage: curl -sL <raw-url> | bash -s -- <SERVER_IP> <TINYBIRD_TOKEN>

SERVER_IP=${1:-$(curl -s ifconfig.me)}
TINYBIRD_TOKEN=${2:-"p.eyJ1IjogImMwMzM4YWE1LTg2NjEtNGE1Yi05YWU4LTU3ZjE3ZGRhZDRkZCIsICJpZCI6ICI5Y2I3NTIxYy1mNGY5LTQ0YWUtOTQ5ZS1kNDBjMWE4Mzg3NmUiLCAiaG9zdCI6ICJ1c19lYXN0In0.a6EguNP4LG3Ci2o309rKJChim5qIJAzX5f4P8rn_d6A"}

echo "=== HP DNS Server Deploy ==="
echo "Server IP: $SERVER_IP"
echo ""

# 1. Install dependencies
echo "[1/6] Installing Docker and WireGuard tools..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
fi
apt-get update -qq && apt-get install -y -qq wireguard-tools

# 2. Setup directory
echo "[2/6] Setting up /opt/dns-vpn..."
mkdir -p /opt/dns-vpn
cd /opt/dns-vpn

# Clone or update repo
if [ -d ".git" ]; then
    git pull
else
    git clone https://github.com/user/higher-power.git .
fi

# 3. Setup docker-compose
echo "[3/6] Configuring docker-compose..."
cp services/dns-server/docker-compose.production.yml docker-compose.yml
ln -sf services/dns-server hp-dns-gw

# 4. Generate WireGuard keys and configs
echo "[4/6] Generating WireGuard keys..."
mkdir -p wg-config/{server,wg_confs,coredns}

# Generate keys if not exist
if [ ! -f wg-config/server/privatekey-server ]; then
    wg genkey | tee wg-config/server/privatekey-server | wg pubkey > wg-config/server/publickey-server
    chmod 600 wg-config/server/privatekey-server
fi

WG_PRIVATE_KEY=$(cat wg-config/server/privatekey-server)
WG_PUBLIC_KEY=$(cat wg-config/server/publickey-server)

# Create wg0.conf from template
sed "s|__WG_PRIVATE_KEY__|$WG_PRIVATE_KEY|g" \
    services/dns-server/deploy-templates/wg_confs/wg0.conf.template \
    > wg-config/wg_confs/wg0.conf
chmod 600 wg-config/wg_confs/wg0.conf

# Copy Corefile (critical for port 5353)
cp services/dns-server/deploy-templates/coredns/Corefile wg-config/coredns/

# 5. Create .env
echo "[5/6] Creating .env..."
cat > .env << EOF
WG_SERVER_PUBKEY=$WG_PUBLIC_KEY
SERVER_IP=$SERVER_IP
JWT_SECRET=$(openssl rand -hex 32)
HMAC_SECRET=$(openssl rand -hex 32)
TINYBIRD_TOKEN=$TINYBIRD_TOKEN
EOF

# 6. Deploy
echo "[6/6] Building and starting containers..."
docker compose build hp-dns-gw
docker compose up -d

echo ""
echo "=== Deploy Complete ==="
echo "WireGuard public key: $WG_PUBLIC_KEY"
echo ""
echo "HSD will take ~2 hours to sync. Check progress with:"
echo "  docker logs -f hp-hsd"
echo ""
echo "Test DNS after HSD syncs:"
echo "  dig @10.13.13.1 google.com"
echo "  dig @10.13.13.1 shakestation"
